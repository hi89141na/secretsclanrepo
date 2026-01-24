const { uploadImage, uploadMultipleImages } = require('../utils/cloudinary');

const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const result = await uploadImage(req.file.buffer, 'secretsclan/products');

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('No files uploaded');
    }

    const results = await uploadMultipleImages(req.files, 'secretsclan/products');

    res.json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results.map(r => ({
        url: r.url,
        publicId: r.publicId
      }))
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    const result = await uploadImage(req.file.buffer, 'secretsclan/categories');

    res.json({
      success: true,
      message: 'Category image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

module.exports = {
  uploadSingleImage,
  uploadProductImages,
  uploadCategoryImage
};
