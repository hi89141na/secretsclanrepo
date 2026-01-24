const express = require('express');
const router = express.Router();
const { fixSaleDates } = require('../controllers/fixSaleController');

router.get('/fix-sale-dates', fixSaleDates);

module.exports = router;
