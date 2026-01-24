const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const products = await Product.find().populate('category');
    
    console.log(`Found ${products.length} products:\n`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Category: ${p.category?.name || 'None'}`);
      console.log(`   Image: ${p.image ? p.image.substring(0, 80) + '...' : 'No image'}`);
      console.log(`   Stock: ${p.stock}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkProducts();
