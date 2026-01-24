import React, { useState } from 'react';

const ProductImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <img
          src={images[selectedImage]}
          alt="Product"
          className="w-full h-96 object-cover rounded-lg"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`border-2 rounded-lg overflow-hidden ${
                selectedImage === index ? 'border-indigo-600' : 'border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;