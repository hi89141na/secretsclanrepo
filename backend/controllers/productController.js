const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const getProducts = async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const products = await Product.find(filter).populate('category', 'name slug').sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).populate('category', 'name slug').limit(8);
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId }).populate('category', 'name slug');
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

const createProduct = async (req, res) => {
  try {
    let { name, description, price, category, stock, brand, images, featured, salePrice, saleStartDate, saleEndDate } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name, price, and category' });
    }

    let imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'products'));
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((result) => result.secure_url);
    } else if (req.body.image) {
      product.images = [req.body.image];
    } else if (images) {
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [images];
        }
      }
      imageUrls = Array.isArray(images) ? images : [images];
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      brand: brand || '',
      images: imageUrls,
      image: imageUrls[0] || 'https://via.placeholder.com/300',
      featured: featured === 'true' || featured === true,
      salePrice: salePrice ? Number(salePrice) : null,
      saleStartDate: saleStartDate || null,
      saleEndDate: saleEndDate || null,
      user: req.user._id
    });
    
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    let { name, description, price, category, stock, brand, images, featured, salePrice, saleStartDate, saleEndDate } = req.body;
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let newImageUrls = [];
    
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer, 'products'));
      const uploadResults = await Promise.all(uploadPromises);
      newImageUrls = uploadResults.map((result) => result.secure_url);
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.brand = brand || product.brand;
    product.featured = featured !== undefined ? (featured === 'true' || featured === true) : product.featured;
    product.salePrice = salePrice !== undefined ? (salePrice ? Number(salePrice) : null) : product.salePrice;
    product.saleStartDate = saleStartDate !== undefined ? saleStartDate : product.saleStartDate;
    product.saleEndDate = saleEndDate !== undefined ? saleEndDate : product.saleEndDate;
    
    if (newImageUrls.length > 0) {
      product.images = [...product.images, ...newImageUrls];
    } else if (req.body.image) {
      product.images = [req.body.image];
    } else if (images) {
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [images];
        }
      }
      product.images = Array.isArray(images) ? images : [images];
    }

    product.image = product.images[0] || 'https://via.placeholder.com/300';

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { getProducts, getFeaturedProducts, getProduct, getProductsByCategory, createProduct, updateProduct, deleteProduct };