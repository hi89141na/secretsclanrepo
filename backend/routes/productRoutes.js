const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/').get(getProducts).post(protect, admin, upload.array('images', 5), createProduct);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.route('/:id').get(getProduct).put(protect, admin, upload.array('images', 5), updateProduct).delete(protect, admin, deleteProduct);

module.exports = router;