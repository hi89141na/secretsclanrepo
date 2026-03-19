const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { forgotPasswordLimiter, resetPasswordLimiter } = require('../middlewares/rateLimitMiddleware');
const { 
  register, 
  verifyEmail,
  resendVerification,
  login, 
  googleCallback,
  getProfile, 
  updateProfile 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { requestPasswordReset, validateResetToken, resetPassword } = require('../services/authService');

// Basic auth routes
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=Authentication failed`
  }),
  googleCallback
);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Password Reset Routes
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const result = await requestPasswordReset(email);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  }
});

router.post('/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    const user = await validateResetToken(token);
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
});

router.post('/reset-password', resetPasswordLimiter, async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and passwords are required'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    const result = await resetPassword(token, password);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
});

module.exports = router;



