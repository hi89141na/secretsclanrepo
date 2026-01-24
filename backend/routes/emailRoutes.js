const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { sendBulkPromotionalEmail } = require('../controllers/emailController');

router.post('/promotional', protect, admin, sendBulkPromotionalEmail);

module.exports = router;


