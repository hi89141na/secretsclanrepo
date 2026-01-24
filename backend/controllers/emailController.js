const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../services/emailService');

// @desc    Send bulk promotional email to all users
// @route   POST /api/emails/bulk-promotional
// @access  Private/Admin
exports.sendBulkPromotionalEmail = async (req, res) => {
  try {
    const { subject, message, offerDetails } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and message are required' 
      });
    }

    // Get all users with valid emails
    const users = await User.find({ email: { $exists: true, $ne: '' } }).select('name email');

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No users found to send emails' 
      });
    }

    console.log(`Sending promotional email to ${users.length} users...`);

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    // Send emails to all users
    for (const user of users) {
      try {
        const emailTemplate = emailTemplates.promotional(
          user.name,
          subject,
          message,
          offerDetails || null
        );

        const result = await sendEmail(user.email, emailTemplate);
        
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({
            email: user.email,
            error: result.error
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: user.email,
          error: error.message
        });
        console.error(`Failed to send email to ${user.email}:`, error.message);
      }
    }

    console.log(`Bulk email complete: ${results.successful} successful, ${results.failed} failed`);

    res.json({ 
      success: true, 
      message: `Promotional emails sent to ${results.successful} users`,
      results 
    });
  } catch (error) {
    console.error('Bulk promotional email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send promotional emails' 
    });
  }
};

// @desc    Send test email
// @route   POST /api/emails/test
// @access  Private/Admin
exports.sendTestEmail = async (req, res) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, subject, and message are required' 
      });
    }

    const emailTemplate = {
      subject,
      html: `<div style='font-family: Arial; max-width: 600px;'><h2>Test Email</h2><p>${message}</p></div>`
    };

    const result = await sendEmail(email, emailTemplate);

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: result.error || 'Failed to send test email' 
      });
    }
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
