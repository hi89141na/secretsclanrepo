const fs = require("fs");
const path = require("path");

console.log("\n🔧 Starting Store-Wide Offers System Implementation...\n");

// File 1: Update Offer Model
const offerModelPath = path.join(__dirname, "backend", "models", "Offer.js");
const offerModelContent = `const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Offer description is required']
  },
  scope: {
    type: String,
    enum: ['entire_store', 'categories', 'products'],
    required: [true, 'Offer scope is required'],
    default: 'products'
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  minPurchaseAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

offerSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
};

offerSchema.pre('save', function(next) {
  if (this.scope === 'entire_store') {
    this.applicableProducts = [];
    this.applicableCategories = [];
  } else if (this.scope === 'categories' && this.applicableCategories.length === 0) {
    return next(new Error('At least one category must be selected for category scope'));
  } else if (this.scope === 'products' && this.applicableProducts.length === 0) {
    return next(new Error('At least one product must be selected for product scope'));
  }
  next();
});

module.exports = mongoose.model('Offer', offerSchema);
`;

try {
  fs.writeFileSync(offerModelPath, offerModelContent, "utf8");
  console.log("✅ Updated: backend/models/Offer.js");
} catch (err) {
  console.error("❌ Error updating Offer.js:", err.message);
}

console.log("\n✨ Step 1/10 Complete - Offer Model Updated\n");
