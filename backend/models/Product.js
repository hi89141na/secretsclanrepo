const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  images: [{
    type: String
  }],
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: 0,
    default: 0
  },
  variants: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  featured: {
    type: Boolean,
    default: false
  },
  salePrice: {
    type: Number,
    min: 0,
    default: null
  },
  saleStartDate: {
    type: Date,
    default: null
  },
  saleEndDate: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

