const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getAllOffers,
  getActiveOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer
} = require('../controllers/offerController');

router.get('/', getAllOffers);
router.get('/active', getActiveOffers);
router.post('/', protect, admin, createOffer);
router.put('/:id', protect, admin, updateOffer);
router.patch('/:id/toggle', protect, admin, toggleOfferStatus);
router.delete('/:id', protect, admin, deleteOffer);

module.exports = router;


