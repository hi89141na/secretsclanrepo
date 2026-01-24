const Offer = require('../models/Offer');

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
    const { title, description, discountType, discountValue, startDate, endDate, applicableProducts, applicableCategories, minPurchaseAmount, maxDiscountAmount } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }

    const offer = await Offer.create({
      title,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
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
    const { title, description, discountType, discountValue, startDate, endDate, applicableProducts, applicableCategories, minPurchaseAmount, maxDiscountAmount, isActive } = req.body;

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

    // Update fields
    offer.title = title !== undefined ? title : offer.title;
    offer.description = description !== undefined ? description : offer.description;
    offer.discountType = discountType !== undefined ? discountType : offer.discountType;
    offer.discountValue = discountValue !== undefined ? discountValue : offer.discountValue;
    offer.startDate = newStartDate;
    offer.endDate = newEndDate;
    offer.applicableProducts = applicableProducts !== undefined ? applicableProducts : offer.applicableProducts;
    offer.applicableCategories = applicableCategories !== undefined ? applicableCategories : offer.applicableCategories;
    offer.minPurchaseAmount = minPurchaseAmount !== undefined ? minPurchaseAmount : offer.minPurchaseAmount;
    offer.maxDiscountAmount = maxDiscountAmount !== undefined ? maxDiscountAmount : offer.maxDiscountAmount;
    offer.isActive = isActive !== undefined ? isActive : offer.isActive;

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

    offer.isActive = !offer.isActive;
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