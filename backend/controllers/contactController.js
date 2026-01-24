const nodemailer = require('nodemailer');

const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Contact Form: ' + subject,
      html: '<h3>Contact</h3><p>Name: ' + name + '</p><p>Email: ' + email + '</p><p>Message: ' + message + '</p>',
      replyTo: email
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendContactEmail };