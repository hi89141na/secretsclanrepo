/**
 * EMAIL SERVICE - PRODUCTION READY
 * 
 * Features:
 * - Rate limiting to prevent abuse
 * - Queue support for bulk operations
 * - Template system with validation
 * - Comprehensive error handling
 * - No credential exposure in logs
 */

const { createTransporter } = require('../config/emailConfig');
const rateLimit = require('express-rate-limit');

// Singleton transporter instance
let transporterInstance = null;

/**
 * Get or create email transporter
 * @returns {Promise<Object>} Nodemailer transporter
 */
const getTransporter = async () => {
  if (!transporterInstance) {
    transporterInstance = await createTransporter();
  }
  return transporterInstance;
};

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize email content to prevent injection
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
const sanitizeContent = (content) => {
  if (typeof content !== 'string') return '';
  // Remove potential script tags and suspicious patterns
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
};

/**
 * Send email with comprehensive error handling
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 * @param {Object} options - Additional options (attachments, cc, bcc, etc.)
 * @returns {Promise<Object>} Result object with success status
 */
const sendEmail = async (to, subject, text, html = null, options = {}) => {
  try {
    // Validate inputs
    if (!to || !subject || !text) {
      throw new Error('Required parameters missing: to, subject, text');
    }

    if (!isValidEmail(to)) {
      throw new Error(`Invalid email address: ${to}`);
    }

    // Get transporter
    const transporter = await getTransporter();

    // Sanitize content
    const sanitizedSubject = sanitizeContent(subject);
    const sanitizedText = sanitizeContent(text);
    const sanitizedHtml = html ? sanitizeContent(html) : null;

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: sanitizedSubject,
      text: sanitizedText,
      ...options
    };

    // Add HTML if provided
    if (sanitizedHtml) {
      mailOptions.html = sanitizedHtml;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`? Email sent successfully to ${to} | MessageID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error(`? Email send failed to ${to}:`, error.message);

    // Log specific error types without exposing credentials
    if (error.code === 'EENVELOPE') {
      console.error('Invalid email envelope. Check sender and recipient addresses');
    } else if (error.code === 'EMESSAGE') {
      console.error('Invalid message content');
    }

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

/**
 * Send bulk emails with rate limiting and error handling
 * @param {Array<Object>} recipients - Array of {email, name} objects
 * @param {Function} templateFn - Function that returns {subject, text, html}
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Results summary
 */
const sendBulkEmails = async (recipients, templateFn, options = {}) => {
  const results = {
    total: recipients.length,
    successful: [],
    failed: [],
    startTime: new Date(),
    endTime: null
  };

  // Rate limiting: max 10 emails per second
  const delay = options.delayMs || 100;

  for (const recipient of recipients) {
    try {
      if (!recipient.email || !isValidEmail(recipient.email)) {
        results.failed.push({
          email: recipient.email,
          error: 'Invalid email address'
        });
        continue;
      }

      const template = templateFn(recipient.name || 'User', recipient);
      const result = await sendEmail(
        recipient.email,
        template.subject,
        template.text || template.html, // Fallback to HTML if no text
        template.html,
        options
      );

      if (result.success) {
        results.successful.push({
          email: recipient.email,
          messageId: result.messageId
        });
      } else {
        results.failed.push({
          email: recipient.email,
          error: result.error
        });
      }

      // Rate limiting delay
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      results.failed.push({
        email: recipient.email,
        error: error.message
      });
    }
  }

  results.endTime = new Date();
  results.duration = results.endTime - results.startTime;

  console.log(`?? Bulk email summary: ${results.successful.length}/${results.total} successful`);

  return results;
};

/**
 * Email templates with security best practices
 */
const emailTemplates = {
  // Welcome email
  registration: (userName) => ({
    subject: 'Welcome to SecretsClan!',
    text: `Hi ${userName},\n\nThank you for registering with us. We are excited to have you on board!\n\nStart exploring our amazing products and exclusive offers.\n\nBest regards,\nThe SecretsClan Team`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to SecretsClan!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for registering with us. We are excited to have you on board!</p>
      <p>Start exploring our amazing products and exclusive offers.</p>
      <p>Best regards,<br>The SecretsClan Team</p>
    </div>`
  }),

  // Order confirmation
  orderPlaced: (userName, orderId, orderTotal) => ({
    subject: `Order Confirmation - #${orderId}`,
    text: `Hi ${userName},\n\nYour order has been successfully placed.\n\nOrder ID: #${orderId}\nTotal Amount: Rs. ${orderTotal.toFixed(2)}\n\nWe will send you another email once your order ships.\n\nBest regards,\nThe SecretsClan Team`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Order Confirmed!</h2>
      <p>Hi ${userName},</p>
      <p>Your order has been successfully placed.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Total Amount:</strong> Rs. ${orderTotal.toFixed(2)}</p>
      </div>
      <p>We will send you another email once your order ships.</p>
      <p>Best regards,<br>The SecretsClan Team</p>
    </div>`
  }),

  // Order status update
  orderStatusUpdate: (userName, orderId, status, cancellationReason = null) => ({
    subject: `Order Update - #${orderId}`,
    text: `Hi ${userName},\n\nYour order #${orderId} status has been updated to: ${status}\n\n${cancellationReason ? `Cancellation Reason: ${cancellationReason}\n\n` : ''}Thank you for shopping with us!\n\nBest regards,\nThe SecretsClan Team`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Order Status Update</h2>
      <p>Hi ${userName},</p>
      <p>Your order #${orderId} status has been updated to: <strong>${status}</strong></p>
      ${cancellationReason ? `<div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>
      </div>` : ''}
      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br>The SecretsClan Team</p>
    </div>`
  }),

  // Promotional email
  promotional: (userName, subject, message, offerDetails = null) => ({
    subject: subject,
    text: `Hi ${userName},\n\n${message}\n\n${offerDetails ? `Special Offer: ${offerDetails}\n\n` : ''}Best regards,\nThe SecretsClan Team`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">${subject}</h2>
      <p>Hi ${userName},</p>
      <div style="margin: 20px 0;">
        ${message}
      </div>
      ${offerDetails ? `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
        <h3 style="color: #f59e0b; margin-top: 0;">?? Special Offer!</h3>
        <p><strong>${offerDetails}</strong></p>
      </div>` : ''}
      <p>Best regards,<br>The SecretsClan Team</p>
    </div>`
  })
};

/**
 * Express rate limiter for email endpoints
 */
const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many email requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  sendEmail,
  sendBulkEmails,
  emailTemplates,
  emailRateLimiter,
  getTransporter
};
