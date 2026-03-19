/**
 * Offer Scheduler
 * Automatically deactivates expired offers
 */

const Offer = require('../models/Offer');

/**
 * Check and deactivate expired offers
 */
const deactivateExpiredOffers = async () => {
  try {
    const now = new Date();
    
    console.log(`[${new Date().toISOString()}] Checking for expired offers...`);
    
    // Find all active offers that have expired
    const expiredOffers = await Offer.find({
      isActive: true,
      endDate: { $lt: now }
    }).timeout(10000); // Add 10 second timeout for this query

    if (expiredOffers && expiredOffers.length > 0) {
      console.log(`Found ${expiredOffers.length} expired offer(s)`);
      
      // Deactivate each expired offer
      const deactivatePromises = expiredOffers.map(async (offer) => {
        offer.isActive = false;
        await offer.save();
        console.log(`  ? Auto-deactivated: ${offer.title}`);
        return offer;
      });

      await Promise.all(deactivatePromises);
      console.log(`? Successfully deactivated ${expiredOffers.length} expired offer(s)`);
    } else {
      console.log('No expired offers found');
    }
  } catch (error) {
    // Only log non-timeout errors at error level, timeout is a warning
    if (error.message.includes('timeout')) {
      console.warn('Warning: Offer scheduler query timed out (database may be slow)');
    } else {
      console.error('Error deactivating expired offers:', error.message);
    }
  }
};

/**
 * Start the offer scheduler
 * Checks for expired offers periodically
 */
const startScheduler = () => {
  try {
    // Initial delay of 5 seconds to ensure database is ready
    setTimeout(() => {
      console.log('Starting initial offer expiration check...');
      deactivateExpiredOffers().catch(err => {
        console.warn('Initial scheduler check failed:', err.message);
      });
    }, 5000);

    // Run every hour (3600000 ms = 1 hour)
    const intervalId = setInterval(() => {
      deactivateExpiredOffers().catch(err => {
        console.warn('Scheduled offer check failed:', err.message);
      });
    }, 3600000);

    // Allow graceful shutdown
    process.on('SIGTERM', () => {
      clearInterval(intervalId);
      console.log('Offer scheduler stopped');
    });

    console.log('? Offer scheduler initialized - will check for expired offers every hour');
  } catch (error) {
    console.error('Failed to start offer scheduler:', error.message);
  }
};

module.exports = { startScheduler, deactivateExpiredOffers };
