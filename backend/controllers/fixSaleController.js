const Product = require('../models/Product');

// Add this temporary endpoint to fix sale dates
const fixSaleDates = async (req, res) => {
  try {
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
    
    const products = await Product.find({ salePrice: { $exists: true, $ne: null } });
    
    res.json({
      success: true,
      message: 'Fixed ' + result.modifiedCount + ' products',
      productsWithSale: products.map(p => ({
        name: p.name,
        price: p.price,
        salePrice: p.salePrice,
        saleStartDate: p.saleStartDate,
        saleEndDate: p.saleEndDate
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { fixSaleDates };
