const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  submitContactForm,
  getAllContacts,
  getContactById,
  replyToContact,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');

// Public route
router.post('/', submitContactForm);

// Admin routes
router.get('/', protect, admin, getAllContacts);
router.get('/:id', protect, admin, getContactById);
router.post('/:id/reply', protect, admin, replyToContact);
router.patch('/:id/status', protect, admin, updateContactStatus);
router.delete('/:id', protect, admin, deleteContact);

module.exports = router;
