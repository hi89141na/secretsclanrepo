/**
 * EXAMPLE USAGE IN EXPRESS ROUTES
 * 
 * This file demonstrates how to use the secure email service
 * in your Express routes with proper error handling and rate limiting
 */

const express = require('express');
const router = express.Router();
const { sendEmail, emailTemplates, emailRateLimiter } = require('../services/emailService.new');
const { protect, admin } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/email/send
 * @desc    Send a single email (protected route)
 * @access  Private
 */
router.post('/send', protect, emailRateLimiter, async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    // Validate input
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    // Send email
    const result = await sendEmail(
      to,
      subject,
      message, // Plain text
      `<p>${message}</p>` // HTML version
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/email/welcome
 * @desc    Send welcome email to new user
 * @access  Public (called during registration)
 */
router.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Get template
    const template = emailTemplates.registration(name);

    // Send email
    const result = await sendEmail(
      email,
      template.subject,
      template.text,
      template.html
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Welcome email sent'
      });
    } else {
      // Don''t fail registration if email fails, just log
      console.error('Welcome email failed:', result.error);
      return res.status(200).json({
        success: true,
        message: 'Registration successful (email notification pending)'
      });
    }

  } catch (error) {
    console.error('Welcome email error:', error);
    return res.status(200).json({
      success: true,
      message: 'Registration successful (email notification failed)'
    });
  }
});

/**
 * @route   POST /api/email/order-confirmation
 * @desc    Send order confirmation email
 * @access  Private
 */
router.post('/order-confirmation', protect, async (req, res) => {
  try {
    const { orderId, totalAmount } = req.body;

    if (!orderId || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and total amount are required'
      });
    }

    // Get template
    const template = emailTemplates.orderPlaced(
      req.user.name,
      orderId,
      totalAmount
    );

    // Send email
    const result = await sendEmail(
      req.user.email,
      template.subject,
      template.text,
      template.html
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Order confirmation sent'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send order confirmation',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Order confirmation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/email/bulk-promotional
 * @desc    Send promotional email to all users (Admin only)
 * @access  Private/Admin
 */
router.post('/bulk-promotional', protect, admin, emailRateLimiter, async (req, res) => {
  try {
    const { subject, message, offerDetails } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Get all users (this should be paginated in real production)
    const User = require('../models/User');
    const users = await User.find({ 
      email: { $exists: true, $ne: '' } 
    }).select('name email').limit(100); // Limit for safety

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found'
      });
    }

    // Import bulk send function
    const { sendBulkEmails } = require('../services/emailService.new');

    // Prepare recipients
    const recipients = users.map(user => ({
      email: user.email,
      name: user.name
    }));

    // Send bulk emails with rate limiting
    const results = await sendBulkEmails(
      recipients,
      (userName) => emailTemplates.promotional(userName, subject, message, offerDetails),
      { delayMs: 100 } // 100ms delay between emails
    );

    return res.status(200).json({
      success: true,
      message: 'Bulk email operation completed',
      results: {
        total: results.total,
        successful: results.successful.length,
        failed: results.failed.length,
        duration: results.duration
      }
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/email/test
 * @desc    Test email configuration (Admin only, dev/staging only)
 * @access  Private/Admin
 */
router.post('/test', protect, admin, async (req, res) => {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Test endpoint disabled in production'
    });
  }

  try {
    const testEmail = process.env.TEST_EMAIL || req.user.email;

    const result = await sendEmail(
      testEmail,
      'Test Email from SecretsClan',
      'This is a test email to verify your email configuration is working correctly.',
      '<p>This is a <strong>test email</strong> to verify your email configuration is working correctly.</p>'
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Test email sent to ${testEmail}`,
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Test email failed',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
