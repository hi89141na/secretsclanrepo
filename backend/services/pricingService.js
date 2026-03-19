/**
 * Pricing Service
 * Handles discount calculations for products with offers
 */

/**
 * Calculate discounted price for a product based on an offer
 * @param {Object} product - Product object with price
 * @param {Object} offer - Offer object with discountType and discountValue
 * @returns {Object} { originalPrice, discountedPrice, discountAmount }
 */
exports.calculateOfferPrice = (product, offer) => {
  const originalPrice = product.price;
  let discountAmount = 0;

  if (offer.discountType === 'percentage') {
    discountAmount = (originalPrice * offer.discountValue) / 100;
    
    // Apply max discount cap if specified
    if (offer.maxDiscountAmount && discountAmount > offer.maxDiscountAmount) {
      discountAmount = offer.maxDiscountAmount;
    }
  } else if (offer.discountType === 'fixed') {
    discountAmount = offer.discountValue;
  }

  const discountedPrice = Math.max(0, originalPrice - discountAmount);

  return {
    originalPrice,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2))
  };
};

/**
 * Apply the best discount available for a product
 * Compares product's salePrice with offer discount and returns the better deal
 * @param {Object} product - Product object
 * @param {Object} offer - Offer object (optional)
 * @returns {Object} { price, originalPrice, discountedPrice, discountSource }
 */
exports.applyBestDiscount = (product, offer = null) => {
  const now = new Date();
  const saleStart = product.saleStartDate ? new Date(product.saleStartDate) : null;
  const saleEnd = product.saleEndDate ? new Date(product.saleEndDate) : null;
  
  // Check if product has active sale price
  const hasActiveSale = product.salePrice && 
                        product.salePrice < product.price &&
                        (!saleStart || now >= saleStart) && 
                        (!saleEnd || now <= saleEnd);

  let bestPrice = product.price;
  let originalPrice = product.price;
  let discountSource = null;

  // If no offer provided, just return sale price if active
  if (!offer) {
    if (hasActiveSale) {
      return {
        price: product.salePrice,
        originalPrice: product.price,
        discountedPrice: product.salePrice,
        discountSource: 'sale'
      };
    }
    return {
      price: product.price,
      originalPrice: product.price,
      discountedPrice: null,
      discountSource: null
    };
  }

  // Calculate offer price
  const offerPricing = exports.calculateOfferPrice(product, offer);
  const offerPrice = offerPricing.discountedPrice;

  // Compare prices and choose the best (lowest) for customer
  if (hasActiveSale && offerPrice) {
    if (product.salePrice <= offerPrice) {
      bestPrice = product.salePrice;
      discountSource = 'sale';
    } else {
      bestPrice = offerPrice;
      discountSource = 'offer';
    }
  } else if (hasActiveSale) {
    bestPrice = product.salePrice;
    discountSource = 'sale';
  } else if (offerPrice) {
    bestPrice = offerPrice;
    discountSource = 'offer';
  }

  return {
    price: bestPrice,
    originalPrice: originalPrice,
    discountedPrice: bestPrice < originalPrice ? bestPrice : null,
    discountSource: discountSource
  };
};

/**
 * Check if an offer is currently valid/active
 * @param {Object} offer - Offer object
 * @returns {Boolean}
 */
exports.isOfferValid = (offer) => {
  if (!offer || !offer.isActive) return false;
  
  const now = new Date();
  return offer.startDate <= now && offer.endDate >= now;
};

/**
 * Get all active offers that apply to a specific product
 * @param {Object} product - Product object
 * @param {Array} offers - Array of offer objects
 * @returns {Array} Array of applicable offers
 */
exports.getApplicableOffers = (product, offers) => {
  const now = new Date();
  
  return offers.filter(offer => {
    // Check if offer is active and within date range
    if (!exports.isOfferValid(offer)) return false;

    // Check scope
    if (offer.scope === 'entire_store') return true;
    
    if (offer.scope === 'categories') {
      const categoryIds = offer.applicableCategories.map(cat => 
        cat._id ? cat._id.toString() : cat.toString()
      );
      const productCategoryId = product.category._id ? 
        product.category._id.toString() : 
        product.category.toString();
      return categoryIds.includes(productCategoryId);
    }
    
    if (offer.scope === 'products') {
      const productIds = offer.applicableProducts.map(p => 
        p._id ? p._id.toString() : p.toString()
      );
      const productId = product._id ? product._id.toString() : product.toString();
      return productIds.includes(productId);
    }
    
    return false;
  });
};

module.exports = exports;