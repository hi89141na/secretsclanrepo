const Offer = require('../models/Offer');

/**
 * Helper function to check for overlapping store-wide offers
 */
const checkStoreWideOfferOverlap = async (startDate, endDate, excludeOfferId = null) => {
  const query = {
    scope: 'entire_store',
    isActive: true,
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  };
  
  if (excludeOfferId) {
    query._id = { $ne: excludeOfferId };
  }
  
  const overlappingOffer = await Offer.findOne(query);
  return overlappingOffer;
};

// @desc    Get all offers
// @route   GET /api/offers
// @access  Private/Admin
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Fetched ${offers.length} offers`);
    res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Get all offers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active offers
// @route   GET /api/offers/active
// @access  Public
exports.getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('applicableProducts', 'name price image')
      .populate('applicableCategories', 'name');
    
    console.log(`Found ${offers.length} active offers`);
    res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Get active offers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res) => {
  try {
    const { title, description, discountType, discountValue, startDate, endDate, applicableProducts, applicableCategories, minPurchaseAmount, maxDiscountAmount, scope } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }

    // Check for store-wide offer overlap
    if (scope === 'entire_store') {
      const overlappingOffer = await checkStoreWideOfferOverlap(startDate, endDate);
      if (overlappingOffer) {
        return res.status(400).json({
          success: false,
          message: `A store-wide offer "${overlappingOffer.title}" already exists for the selected date range. Only one store-wide offer can be active at a time.`
        });
      }
    }

    // Validate scope requirements
    if (scope === 'categories' && (!applicableCategories || applicableCategories.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one category for category-scoped offers'
      });
    }

    if (scope === 'products' && (!applicableProducts || applicableProducts.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one product for product-scoped offers'
      });
    }

    const offer = await Offer.create({
      title,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
      scope: scope || 'products',
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      minPurchaseAmount: minPurchaseAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      isActive: true
    });

    const populatedOffer = await Offer.findById(offer._id)
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name');

    console.log(`Created offer: ${offer.title}`);
    res.status(201).json({ success: true, data: populatedOffer });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
exports.updateOffer = async (req, res) => {
  try {
    const { title, description, discountType, discountValue, startDate, endDate, applicableProducts, applicableCategories, minPurchaseAmount, maxDiscountAmount, isActive, scope } = req.body;

    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Validate dates if provided
    const newStartDate = startDate ? new Date(startDate) : offer.startDate;
    const newEndDate = endDate ? new Date(endDate) : offer.endDate;
    
    if (newStartDate >= newEndDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }

    // Determine final scope
    const newScope = scope !== undefined ? scope : offer.scope;
    const willBeActive = isActive !== undefined ? isActive : offer.isActive;

    // Check for store-wide offer overlap
    if (newScope === 'entire_store' && willBeActive) {
      const overlappingOffer = await checkStoreWideOfferOverlap(newStartDate, newEndDate, offer._id);
      if (overlappingOffer) {
        return res.status(400).json({
          success: false,
          message: `A store-wide offer "${overlappingOffer.title}" already exists for the selected date range. Only one store-wide offer can be active at a time.`
        });
      }
    }

    // Validate scope requirements
    const newProducts = applicableProducts !== undefined ? applicableProducts : offer.applicableProducts;
    const newCategories = applicableCategories !== undefined ? applicableCategories : offer.applicableCategories;

    if (newScope === 'categories' && (!newCategories || newCategories.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one category for category-scoped offers'
      });
    }

    if (newScope === 'products' && (!newProducts || newProducts.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one product for product-scoped offers'
      });
    }

    // Update fields
    offer.title = title !== undefined ? title : offer.title;
    offer.description = description !== undefined ? description : offer.description;
    offer.discountType = discountType !== undefined ? discountType : offer.discountType;
    offer.discountValue = discountValue !== undefined ? discountValue : offer.discountValue;
    offer.startDate = newStartDate;
    offer.endDate = newEndDate;
    offer.scope = newScope;
    offer.applicableProducts = newProducts;
    offer.applicableCategories = newCategories;
    offer.minPurchaseAmount = minPurchaseAmount !== undefined ? minPurchaseAmount : offer.minPurchaseAmount;
    offer.maxDiscountAmount = maxDiscountAmount !== undefined ? maxDiscountAmount : offer.maxDiscountAmount;
    offer.isActive = willBeActive;

    await offer.save();

    const updatedOffer = await Offer.findById(offer._id)
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name');

    console.log(`Updated offer: ${offer.title}`);
    res.json({ success: true, data: updatedOffer });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Toggle offer status
// @route   PATCH /api/offers/:id/toggle
// @access  Private/Admin
exports.toggleOfferStatus = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const newStatus = !offer.isActive;

    // If activating a store-wide offer, check for overlaps
    if (newStatus && offer.scope === 'entire_store') {
      const overlappingOffer = await checkStoreWideOfferOverlap(offer.startDate, offer.endDate, offer._id);
      if (overlappingOffer) {
        return res.status(400).json({
          success: false,
          message: `Cannot activate: A store-wide offer "${overlappingOffer.title}" is already active for this date range.`
        });
      }
    }

    offer.isActive = newStatus;
    await offer.save();

    const updatedOffer = await Offer.findById(offer._id)
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name');

    console.log(`Toggled offer status: ${offer.title} - Active: ${offer.isActive}`);
    res.json({ success: true, data: updatedOffer });
  } catch (error) {
    console.error('Toggle offer status error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    await offer.deleteOne();
    
    console.log(`Deleted offer: ${offer.title}`);
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active store-wide offer
// @route   GET /api/offers/store-wide
// @access  Public
exports.getStoreWideOffer = async (req, res) => {
  try {
    const now = new Date();
    const offer = await Offer.findOne({
      scope: 'entire_store',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!offer) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: offer });
  } catch (error) {
    console.error('Get store-wide offer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get products applicable to an offer
// @route   GET /api/offers/:id/products
// @access  Public
exports.getOfferProducts = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('applicableProducts')
      .populate('applicableCategories');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    let products = [];

    if (offer.scope === 'entire_store') {
      // Get all products
      const Product = require('../models/Product');
      products = await Product.find({ stock: { $gt: 0 } }).populate('category', 'name');
    } else if (offer.scope === 'categories') {
      // Get products from selected categories
      const Product = require('../models/Product');
      const categoryIds = offer.applicableCategories.map(cat => cat._id);
      products = await Product.find({ 
        category: { $in: categoryIds },
        stock: { $gt: 0 }
      }).populate('category', 'name');
    } else if (offer.scope === 'products') {
      // Use the populated products
      products = offer.applicableProducts.filter(p => p.stock > 0);
    }

    res.json({ success: true, data: products, offer: offer });
  } catch (error) {
    console.error('Get offer products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
