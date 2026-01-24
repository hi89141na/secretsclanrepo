const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { uploadSingleImage, uploadProductImages, uploadCategoryImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/image', protect, admin, upload.single('image'), uploadSingleImage);
router.post('/products', protect, admin, upload.array('images', 5), uploadProductImages);
router.post('/category', protect, admin, upload.single('image'), uploadCategoryImage);

module.exports = router;