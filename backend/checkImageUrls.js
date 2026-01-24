const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const products = await Product.find().limit(3);
  console.log('First 3 products in database:\n');
  products.forEach((p, i) => {
    console.log(`. `);
    console.log(`   Image: \n`);
  });
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
