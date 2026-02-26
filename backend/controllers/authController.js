const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const result = await authService.registerUser({ name, email, password, phone });

    res.status(201).json({
      success: true,
      data: result.user,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const result = await authService.verifyEmail(token);

    res.status(200).json({
      success: true,
      user: result.user,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await authService.resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to resend verification email'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const result = await authService.loginUser(email, password);

    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Google authentication failed`);
    }

    const token = generateToken(user._id);

    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password && (user.authProvider === 'local' || user.authProvider === 'local+google')) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      token: generateToken(updatedUser._id),
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        isVerified: updatedUser.isVerified,
        authProvider: updatedUser.authProvider
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

module.exports = { 
  register, 
  verifyEmail, 
  resendVerification,
  login, 
  googleCallback,
  getProfile, 
  updateProfile 
};