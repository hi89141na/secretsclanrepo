const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixSaleDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Product = mongoose.model('Product', require('./models/Product').schema);
    
    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    const result = await Product.updateMany(
      {
        salePrice: { $exists: true, $ne: null },
        $or: [
          { saleStartDate: { $exists: false } },
          { saleStartDate: null },
          { saleEndDate: { $exists: false } },
          { saleEndDate: null }
        ]
      },
      {
        $set: {
          saleStartDate: today,
          saleEndDate: oneYearLater
        }
      }
    );
    
    console.log('Updated products:', result.modifiedCount);
    
    const products = await Product.find({ salePrice: { $exists: true, $ne: null } });
    console.log('\nProducts with sale prices:');
    products.forEach(p => {
      console.log(`- ${p.name}: $${p.price} -> $${p.salePrice} (${p.saleStartDate} to ${p.saleEndDate})`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit();
}

fixSaleDates();
