require('dotenv').config();
const { uploadToCloudinary } = require('./utils/cloudinary');

console.log('Cloudinary function:', typeof uploadToCloudinary);
console.log('Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set',
});
