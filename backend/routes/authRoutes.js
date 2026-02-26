const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
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

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', login);

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

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;