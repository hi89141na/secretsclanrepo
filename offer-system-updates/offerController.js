const Offer = require('../models/Offer');
const Product = require('../models/Product');

// @desc    Get all offers
// @route   GET /api/offers
// @access  Private/Admin
exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('applicableProducts', 'name price image')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`Fetched ${offers.length} offers`);
    res.json({ success: true, data: offers });
  } catch (error) {
    console.error('Get all offers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active offers (within date range)
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

// @desc    Get current store-wide offer (for banner display)
// @route   GET /api/offers/store-wide
// @access  Public
exports.getStoreWideOffer = async (req, res) => {
  try {
    const now = new Date();
    const storeWideOffer = await Offer.findOne({
      scope: 'entire_store',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
      .populate('applicableProducts', 'name price image')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 });
    
    if (!storeWideOffer) {
      return res.json({ success: true, data: null });
    }
    
    res.json({ success: true, data: storeWideOffer });
  } catch (error) {
    console.error('Get store-wide offer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get products applicable to a specific offer
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
    
    if (!offer.isValid()) {
      return res.status(400).json({ 
        success: false, 
        message: 'This offer is not currently active' 
      });
    }
    
    let products = [];
    
    if (offer.scope === 'entire_store') {
      products = await Product.find({ stock: { $gt: 0 } })
        .populate('category', 'name');
    } else if (offer.scope === 'categories') {
      const categoryIds = offer.applicableCategories.map(cat => cat._id);
      products = await Product.find({ 
        category: { $in: categoryIds },
        stock: { $gt: 0 }
      }).populate('category', 'name');
    } else if (offer.scope === 'products') {
      products = offer.applicableProducts;
    }
    
    const productsWithDiscount = products.map(product => {
      const productObj = product.toObject ? product.toObject() : product;
      let discountedPrice = productObj.price;
      
      if (offer.discountType === 'percentage') {
        discountedPrice = productObj.price * (1 - offer.discountValue / 100);
      } else {
        discountedPrice = productObj.price - offer.discountValue;
      }
      
      if (offer.maxDiscountAmount) {
        const discount = productObj.price - discountedPrice;
        if (discount > offer.maxDiscountAmount) {
          discountedPrice = productObj.price - offer.maxDiscountAmount;
        }
      }
      
      return {
        ...productObj,
        originalPrice: productObj.price,
        discountedPrice: Math.max(0, discountedPrice),
        offerDiscount: offer.discountValue,
        offerDiscountType: offer.discountType
      };
    });
    
    res.json({ 
      success: true, 
      data: {
        offer: {
          _id: offer._id,
          title: offer.title,
          description: offer.description,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          scope: offer.scope
        },
        products: productsWithDiscount
      }
    });
  } catch (error) {
    console.error('Get offer products error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res) => {
  try {
    const { 
      title, description, scope, discountType, discountValue, 
      startDate, endDate, applicableProducts, applicableCategories, 
      minPurchaseAmount, maxDiscountAmount 
    } = req.body;

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }

    if (scope === 'entire_store') {
      const existingStoreWideOffer = await Offer.findOne({
        scope: 'entire_store',
        isActive: true,
        $or: [
          { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
        ]
      });
      
      if (existingStoreWideOffer) {
        return res.status(400).json({ 
          success: false, 
          message: `A store-wide offer "${existingStoreWideOffer.title}" already exists for the selected date range. Please deactivate it first or choose different dates.` 
        });
      }
    }

    const offer = await Offer.create({
      title,
      description,
      scope: scope || 'products',
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
      .populate('applicableProducts', 'name price image')
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
    const { 
      title, description, scope, discountType, discountValue, 
      startDate, endDate, applicableProducts, applicableCategories, 
      minPurchaseAmount, maxDiscountAmount, isActive 
    } = req.body;

    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const newStartDate = startDate ? new Date(startDate) : offer.startDate;
    const newEndDate = endDate ? new Date(endDate) : offer.endDate;
    
    if (newStartDate >= newEndDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'End date must be after start date' 
      });
    }

    const newScope = scope !== undefined ? scope : offer.scope;
    const newIsActive = isActive !== undefined ? isActive : offer.isActive;
    
    if (newScope === 'entire_store' && newIsActive) {
      const existingStoreWideOffer = await Offer.findOne({
        _id: { $ne: offer._id },
        scope: 'entire_store',
        isActive: true,
        $or: [
          { startDate: { $lte: newEndDate }, endDate: { $gte: newStartDate } }
        ]
      });
      
      if (existingStoreWideOffer) {
        return res.status(400).json({ 
          success: false, 
          message: `A store-wide offer "${existingStoreWideOffer.title}" already exists for the selected date range.` 
        });
      }
    }

    offer.title = title !== undefined ? title : offer.title;
    offer.description = description !== undefined ? description : offer.description;
    offer.scope = newScope;
    offer.discountType = discountType !== undefined ? discountType : offer.discountType;
    offer.discountValue = discountValue !== undefined ? discountValue : offer.discountValue;
    offer.startDate = newStartDate;
    offer.endDate = newEndDate;
    offer.applicableProducts = applicableProducts !== undefined ? applicableProducts : offer.applicableProducts;
    offer.applicableCategories = applicableCategories !== undefined ? applicableCategories : offer.applicableCategories;
    offer.minPurchaseAmount = minPurchaseAmount !== undefined ? minPurchaseAmount : offer.minPurchaseAmount;
    offer.maxDiscountAmount = maxDiscountAmount !== undefined ? maxDiscountAmount : offer.maxDiscountAmount;
    offer.isActive = newIsActive;

    await offer.save();

    const updatedOffer = await Offer.findById(offer._id)
      .populate('applicableProducts', 'name price image')
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
    
    if (newStatus && offer.scope === 'entire_store') {
      const existingStoreWideOffer = await Offer.findOne({
        _id: { $ne: offer._id },
        scope: 'entire_store',
        isActive: true,
        startDate: { $lte: offer.endDate },
        endDate: { $gte: offer.startDate }
      });
      
      if (existingStoreWideOffer) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot activate. Store-wide offer "${existingStoreWideOffer.title}" is already active for overlapping dates.` 
        });
      }
    }

    offer.isActive = newStatus;
    await offer.save();

    const updatedOffer = await Offer.findById(offer._id)
      .populate('applicableProducts', 'name price image')
      .populate('applicableCategories', 'name');

    console.log(`Toggled offer status: ${offer.title} - ${newStatus ? 'Active' : 'Inactive'}`);
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
