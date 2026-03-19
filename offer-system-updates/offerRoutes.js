const express = require('\'');
const router = express.Router();
const {
  getAllOffers,
  getActiveOffers,
  getStoreWideOffer,
  getOfferProducts,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer
} = require('../controllers/offerController'\'');
const { protect, admin } = require('../middlewares/authMiddleware'\'');

// Public routes
router.get('/active'\'', getActiveOffers);
router.get('/store-wide'\'', getStoreWideOffer);
router.get('\'/:id/products'\'', getOfferProducts);

// Admin routes
router.route('/'\''\'').get(protect, admin, getAllOffers).post(protect, admin, createOffer);
router.route('\'/:id'\'').put(protect, admin, updateOffer).delete(protect, admin, deleteOffer);
router.patch('\'/:id/toggle'\'', protect, admin, toggleOfferStatus);

module.exports = router;
