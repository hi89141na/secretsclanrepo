const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    res.json(category);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await Category.create({
      name,
      description,
      image
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    const { name, description, image } = req.body;
    
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Delete category with CASCADE DELETE
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await Category.findById(req.params.id).session(session);

    if (!category) {
      await session.abortTransaction();
      session.endSession();
      res.status(404);
      throw new Error('Category not found');
    }

    console.log(`Deleting category: ${category.name}`);

    // Step 1: Find all products in this category
    const productsInCategory = await Product.find({ category: req.params.id }).session(session);
    const productIds = productsInCategory.map(p => p._id);

    console.log(`Found ${productIds.length} products in category`);

    if (productIds.length > 0) {
      // Step 2: Find all orders containing these products
      const ordersWithProducts = await Order.find({
        'orderItems.productId': { $in: productIds },
        orderStatus: { $nin: ['cancelled', 'delivered'] }
      }).session(session);

      console.log(`Found ${ordersWithProducts.length} orders to cancel`);

      // Step 3: Cancel all these orders
      if (ordersWithProducts.length > 0) {
        const bulkOps = ordersWithProducts.map(order => ({
          updateOne: {
            filter: { _id: order._id },
            update: {
              $set: {
                orderStatus: 'cancelled',
                isCancelled: true,
                cancellationReason: 'Cancelled – Product No Longer Available'
              }
            }
          }
        }));

        await Order.bulkWrite(bulkOps, { session });
        console.log(`Cancelled ${ordersWithProducts.length} orders`);
      }

      // Step 4: Delete all products in this category
      const deleteResult = await Product.deleteMany({ category: req.params.id }).session(session);
      console.log(`Deleted ${deleteResult.deletedCount} products`);
    }

    // Step 5: Delete the category
    await category.deleteOne({ session });
    console.log(`Category deleted: ${category.name}`);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.json({ 
      message: 'Category removed successfully',
      deletedProducts: productIds.length,
      cancelledOrders: ordersWithProducts?.length || 0
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Delete category error:', error);
    res.status(500);
    throw new Error(error.message);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
