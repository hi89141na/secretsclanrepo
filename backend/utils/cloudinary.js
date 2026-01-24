const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'secretsclan/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Upload image from buffer to Cloudinary (alternative name)
const uploadImage = async (fileBuffer, folder = 'secretsclan') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(new Error('Image upload failed'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    const readable = Readable.from(fileBuffer);
    readable.pipe(uploadStream);
  });
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'secretsclan') => {
  const uploadPromises = files.map(file => uploadImage(file.buffer, folder));
  return await Promise.all(uploadPromises);
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

// Alias for deleteFromCloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

module.exports = { 
  uploadToCloudinary, 
  uploadImage, 
  uploadMultipleImages, 
  deleteFromCloudinary,
  deleteImage 
};