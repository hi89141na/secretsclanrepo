console.log("MAIL TEST STARTED");

process.on("unhandledRejection", err => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", err => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing EMAIL_USER or EMAIL_PASS in .env");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // TEMPORARY for your network
      },
    });

    console.log("Transporter created");

    await transporter.verify();
    console.log("SMTP connection verified");

    const info = await transporter.sendMail({
      from: `"Node Mail Test" <${process.env.EMAIL_USER}>`,
      to: process.env.TEST_EMAIL || process.env.EMAIL_USER,
      subject: "Nodemailer Test Email",
      text: "If you received this email, Nodemailer is working.",
      html: "<h2>Nodemailer Test</h2><p>Email setup is working.</p>",
    });

    console.log("Email sent successfully");
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("EMAIL TEST FAILED");
    console.error(error.message || error);
  }
}

testEmail();
