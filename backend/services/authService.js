const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('./emailService');

const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  return { token, expiry };
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  const subject = 'Verify Your Email - SecretsClan';
  const text = `Hi ${user.name},\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not create an account, please ignore this email.\n\nBest regards,\nSecretsClan Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #4F46E5; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
          .button a{
          color: white;
          text-decoration: none;
        }
         .button:hover {
          background: #4338CA;

          }
          a.button{
          color: white;
          text-decoration:none;
          }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .verify-text { color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SecretsClan!</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>Thank you for registering with SecretsClan. Please verify your email address to complete your registration.</p>
          <p style="text-align: center;">
          
            <a href="${verificationUrl}" class="button ">Verify Email</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
          <p class="verify-text"><strong>This link will expire in 1 hour.</strong></p>
          <p>If you did not create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 SecretsClan. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(user.email, subject, text, html);
};

const registerUser = async (userData) => {
  const { name, email, password, phone } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists with this email');
  }

  const { token, expiry } = generateVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    phone,
    authProvider: 'local',
    isVerified: false,
    verificationToken: token,
    verificationTokenExpiry: expiry
  });

  try {
    await sendVerificationEmail(user, token);
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError.message);
  }

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    message: 'Registration successful. Please check your email to verify your account.'
  };
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('User does not exist in the system try again.');
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpiry = null;
  await user.save();

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified
    },
    message: 'Email verified successfully. You can now login with your credentials.'
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.authProvider === 'google') {
    throw new Error('Please login with Google');
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in');
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      authProvider: user.authProvider
    }
  };
};

const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isVerified) {
    throw new Error('Email is already verified');
  }

  const { token, expiry } = generateVerificationToken();
  user.verificationToken = token;
  user.verificationTokenExpiry = expiry;
  await user.save();

  await sendVerificationEmail(user, token);

  return {
    message: 'Verification email sent successfully'
  };
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  resendVerificationEmail,
  generateVerificationToken,
  sendVerificationEmail
};