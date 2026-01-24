const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const emailTemplates = {
  registration: (userName) => ({
    subject: 'Welcome to SecretsClan!',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to SecretsClan!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for registering with us. We are excited to have you on board!</p>
      <p>Start exploring our amazing products and exclusive offers.</p>
      <p>Best regards,<br>The SecretsClan Team</p>
    </div>`
  }),
  
  orderPlaced: (userName, orderId, orderTotal) => ({
    subject: `Order Confirmation - #${orderId}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Order Confirmed!</h2>
      <p>Hi ${userName},</p>
      <p>Your order has been successfully placed.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Total Amount:</strong> $${orderTotal.toFixed(2)}</p>
      </div>
      <p>We will send you another email once your order ships.</p>
      <p>Best regards,<br>The SecretsClan Team</p>
    </div>`
  }),
  
  orderStatusUpdate: (userName, orderId, status, cancellationReason = null) => ({
    subject: `Order Update - #${orderId}`,
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
  
  promotional: (userName, subject, message, offerDetails = null) => ({
    subject: subject,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">${subject}</h2>
      <p>Hi ${userName},</p>
      <div style="margin: 20px 0;">
        ${message}
      </div>
      ${offerDetails ? `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
        <h3 style="color: #f59e0b; margin-top: 0;">🎉 Special Offer!</h3>
        <p><strong>${offerDetails}</strong></p>
      </div>` : ''}
      <p>Best regards,<br>The SecretsClan Team</p>
    </div>`
  })
};

const sendEmail = async (to, template) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'SecretsClan <noreply@secretsclan.com>',
      to: to,
      subject: template.subject,
      html: template.html
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

const sendBulkEmails = async (recipients, templateFn) => {
  const results = { sent: [], failed: [] };
  for (const recipient of recipients) {
    const result = await sendEmail(recipient.email, templateFn(recipient.name));
    if (result.success) {
      results.sent.push(recipient.email);
    } else {
      results.failed.push({ email: recipient.email, error: result.error });
    }
  }
  return results;
};

module.exports = { sendEmail, sendBulkEmails, emailTemplates };
