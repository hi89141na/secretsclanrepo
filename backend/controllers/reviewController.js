
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
    
    res.json(reviews);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      product,
      user: req.user._id
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed by you');
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      res.status(404);
      throw new Error('Product not found');
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
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Check if user is review owner
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this review');
    }

    const { rating, comment } = req.body;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();

    // Update product rating
    await updateProductRating(review.product);

    res.json(updatedReview);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Check if user is review owner or admin
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to delete this review');
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    await updateProductRating(productId);

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    
    const product = await Product.findById(productId);
    
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
  createReview,
  updateReview,
  deleteReview
};
