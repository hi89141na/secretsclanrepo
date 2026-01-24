const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail, emailTemplates } = require('../services/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, shippingCost, taxAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Fetch product details and prepare order items
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      // Update stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        image: product.images?.[0] || product.image || ''
      });
    }

    // Prepare shipping address string
    const shippingAddressString = typeof shippingAddress === 'string' 
      ? shippingAddress 
      : `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: shippingAddressString,
      phone: shippingAddress.phone || req.user.phone || '',
      paymentMethod: paymentMethod || 'COD',
      totalAmount: totalAmount || 0
    });

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name images');

    // Send order placed email
    try {
      const orderEmailTemplate = emailTemplates.orderPlaced(
        req.user.name,
        order._id.toString(),
        order.totalAmount
      );
      await sendEmail(req.user.email, orderEmailTemplate);
      console.log(`Order placed email sent to ${req.user.email}`);
    } catch (emailError) {
      console.error('Failed to send order email:', emailError.message);
      // Don't fail order creation if email fails
    }

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name price images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.productId', 'name images')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.productId', 'name images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    if (status === 'cancelled') {
      order.isCancelled = true;
      order.cancellationReason = cancellationReason || 'Cancelled by admin';

      // Restore stock
      for (const item of order.orderItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    // Send status update email
    try {
      const statusEmailTemplate = emailTemplates.orderStatusUpdate(
        order.user.name,
        order._id.toString(),
        status,
        status === 'cancelled' ? order.cancellationReason : null
      );
      await sendEmail(order.user.email, statusEmailTemplate);
      console.log(`Order status update email sent to ${order.user.email}`);
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError.message);
      // Don't fail status update if email fails
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = 'cancelled';
    order.isCancelled = true;
    order.cancellationReason = reason || 'Cancelled by user';
    await order.save();

    // Send cancellation email
    try {
      const cancelEmailTemplate = emailTemplates.orderStatusUpdate(
        order.user.name,
        order._id.toString(),
        'cancelled',
        order.cancellationReason
      );
      await sendEmail(order.user.email, cancelEmailTemplate);
      console.log(`Order cancellation email sent to ${order.user.email}`);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError.message);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
