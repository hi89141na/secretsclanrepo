
const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createReview);

router.get('/product/:productId', getProductReviews);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
