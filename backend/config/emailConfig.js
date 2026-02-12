/**
 * EMAIL CONFIGURATION - PRODUCTION READY
 * 
 * Security Requirements:
 * - TLS encryption enforced (rejectUnauthorized: true)
 * - No plain credentials in code
 * - Separate dev/prod configurations
 * - Transport verification on startup
 */

const nodemailer = require('nodemailer');

// Email provider configurations
const EMAIL_PROVIDERS = {
  GMAIL: 'gmail',
  SENDGRID: 'sendgrid',
  SES: 'ses',
  MAILGUN: 'mailgun',
  SMTP: 'smtp'
};

/**
 * Get email configuration based on environment
 * @returns {Object} Nodemailer transport configuration
 */
const getEmailConfig = () => {
  const provider = process.env.EMAIL_PROVIDER || EMAIL_PROVIDERS.GMAIL;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Validate required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables');
  }

  const configs = {
    // Gmail with App Password (Recommended for small-medium apps)
    [EMAIL_PROVIDERS.GMAIL]: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Must be App Password, not account password
      },
      secure: true, // Use TLS
      tls: {
        // Enforce TLS - NEVER set rejectUnauthorized: false in production
        rejectUnauthorized: nodeEnv === 'production',
        minVersion: 'TLSv1.2'
      },
      pool: nodeEnv === 'production', // Connection pooling for production
      maxConnections: 5,
      maxMessages: 100
    },

    // SendGrid (Professional SMTP)
    [EMAIL_PROVIDERS.SENDGRID]: {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: 'apikey', // Always 'apikey' for SendGrid
        pass: process.env.SENDGRID_API_KEY
      },
      tls: {
        rejectUnauthorized: nodeEnv === 'production',
        minVersion: 'TLSv1.2'
      }
    },

    // Amazon SES
    [EMAIL_PROVIDERS.SES]: {
      host: process.env.SES_SMTP_HOST || `email-smtp.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.SES_SMTP_USERNAME,
        pass: process.env.SES_SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: nodeEnv === 'production',
        minVersion: 'TLSv1.2'
      }
    },

    // Mailgun
    [EMAIL_PROVIDERS.MAILGUN]: {
      host: process.env.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.MAILGUN_SMTP_USER,
        pass: process.env.MAILGUN_SMTP_PASS
      },
      tls: {
        rejectUnauthorized: nodeEnv === 'production',
        minVersion: 'TLSv1.2'
      }
    },

    // Custom SMTP Server
    [EMAIL_PROVIDERS.SMTP]: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: nodeEnv === 'production',
        minVersion: 'TLSv1.2'
      }
    }
  };

  const config = configs[provider];
  if (!config) {
    throw new Error(`Invalid EMAIL_PROVIDER: ${provider}. Must be one of: ${Object.values(EMAIL_PROVIDERS).join(', ')}`);
  }

  return config;
};

/**
 * Create and verify email transporter
 * @returns {Promise<Object>} Nodemailer transporter
 */
const createTransporter = async () => {
  try {
    const config = getEmailConfig();
    const transporter = nodemailer.createTransport(config);

    // Verify transporter configuration
    await transporter.verify();
    console.log('? Email transporter verified and ready');

    return transporter;
  } catch (error) {
    console.error('? Email transporter verification failed:', error.message);
    
    // Log helpful debugging info without exposing credentials
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check EMAIL_USER and EMAIL_PASS');
      console.error('For Gmail: Ensure you are using an App Password, not your account password');
      console.error('Generate App Password at: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      console.error('Network/connection error. Check firewall and internet connection');
    }
    
    throw error;
  }
};

module.exports = {
  EMAIL_PROVIDERS,
  getEmailConfig,
  createTransporter
};


