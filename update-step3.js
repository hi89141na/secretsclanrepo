const fs = require('fs');
const path = require('path');

console.log('\n🔧 Implementing Backend Files...\n');

// Step 3: Update offerRoutes.js
const routesContent = String.raw`const express = require('express');
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
} = require('../controllers/offerController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/active', getActiveOffers);
router.get('/store-wide', getStoreWideOffer);
router.get('/:id/products', getOfferProducts);

router.route('/').get(protect, admin, getAllOffers).post(protect, admin, createOffer);
router.route('/:id').put(protect, admin, updateOffer).delete(protect, admin, deleteOffer);
router.patch('/:id/toggle', protect, admin, toggleOfferStatus);

module.exports = router;
`;

fs.writeFileSync('backend/routes/offerRoutes.js', routesContent, 'utf8');
console.log('✅ Step 3/10: Updated backend/routes/offerRoutes.js');
