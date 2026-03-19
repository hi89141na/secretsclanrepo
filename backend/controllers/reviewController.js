const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get user's review for a product
// @route   GET /api/reviews/user/:productId
// @access  Private
const getUserReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      product: req.params.productId,
      user: req.user._id
    }).populate('user', 'name');
    
    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    if (!product || !rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide product, rating, and comment' 
      });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product,
      user: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product,
      rating: Number(rating),
      comment
    });

    // Update product rating
    await updateProductRating(product);

    const populatedReview = await Review.findById(review._id).populate('user', 'name');
    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Check if user is review owner
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }

    const { rating, comment } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();

    // Update product rating
    await updateProductRating(review.product);

    const populatedReview = await Review.findById(updatedReview._id).populate('user', 'name');
    res.json({ success: true, data: populatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Check if user is review owner or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    await updateProductRating(productId);

    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    
    const product = await Product.findById(productId);
    
    if (!product) return;
    
    if (reviews.length === 0) {
      product.rating = 0;
      product.numReviews = 0;
    } else {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      product.rating = totalRating / reviews.length;
      product.numReviews = reviews.length;
    }
    
    await product.save();
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

module.exports = {
  getProductReviews,
  getUserReview,
  createReview,
  updateReview,
  deleteReview
};