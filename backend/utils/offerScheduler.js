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
    
    // Find all active offers that have expired
    const expiredOffers = await Offer.find({
      isActive: true,
      endDate: { $lt: now }
    });

    if (expiredOffers.length > 0) {
      // Deactivate each expired offer
      const deactivatePromises = expiredOffers.map(async (offer) => {
        offer.isActive = false;
        await offer.save();
        console.log(`Auto-deactivated expired offer: ${offer.title}`);
        return offer;
      });

      await Promise.all(deactivatePromises);
      console.log(`Deactivated ${expiredOffers.length} expired offer(s)`);
    }
  } catch (error) {
    console.error('Error deactivating expired offers:', error);
  }
};

/**
 * Start the offer scheduler
 * Checks for expired offers every hour
 */
const startScheduler = () => {
  // Run immediately on startup
  deactivateExpiredOffers();

  // Run every hour (3600000 ms)
  const intervalId = setInterval(deactivateExpiredOffers, 3600000);

  console.log('Offer scheduler started - checking for expired offers every hour');

  return intervalId;
};

/**
 * Stop the scheduler
 * @param {Number} intervalId - The interval ID returned by startScheduler
 */
const stopScheduler = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('Offer scheduler stopped');
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  deactivateExpiredOffers
};