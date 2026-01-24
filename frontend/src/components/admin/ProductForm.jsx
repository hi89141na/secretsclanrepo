import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, uploadAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';

const ProductForm = ({ productId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: []
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(productId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to fetch product');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrls = formData.images;
      
      if (imageFiles.length > 0) {
        const formDataImages = new FormData();
        imageFiles.forEach(file => {
          formDataImages.append('images', file);
        });
        const uploadResponse = await uploadAPI.uploadProductImages(formDataImages);
        imageUrls = uploadResponse.data.urls;
      }

      const productData = { ...formData, images: imageUrls };
      
      if (productId) {
        await productAPI.update(productId, productData);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.create(productData);
        toast.success('Product created successfully!');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=+""+"bg-white p-6 rounded-lg shadow-md"+""+>
      <h2 className=+""+"text-2xl font-bold mb-6"+""+>
        {productId ? 'Edit Product' : 'Create Product'}
      </h2>
      
      <Input
        label=+""+"Product Name"+""+
        name=+""+"name"+""+
        value={formData.name}
        onChange={handleChange}
        required
      />
      
      <div className=+""+"mb-4"+""+>
        <label className=+""+"block text-gray-700 text-sm font-bold mb-2"+""+>
          Description
        </label>
        <textarea
          name=+""+"description"+""+
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className=+""+"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"+""+
          required
        />
      </div>
      
      <div className=+""+"grid grid-cols-2 gap-4"+""+>
        <Input
          label=+""+"Price"+""+
          name=+""+"price"+""+
          type=+""+"number"+""+
          step=+""+"0.01"+""+
          value={formData.price}
          onChange={handleChange}
          required
        />
        
        <Input
          label=+""+"Stock"+""+
          name=+""+"stock"+""+
          type=+""+"number"+""+
          value={formData.stock}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className=+""+"mb-4"+""+>
        <label className=+""+"block text-gray-700 text-sm font-bold mb-2"+""+>
          Category
        </label>
        <select
          name=+""+"category"+""+
          value={formData.category}
          onChange={handleChange}
          className=+""+"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"+""+
          required
        >
          <option value=+""+""+""+>Select a category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div className=+""+"mb-4"+""+>
        <label className=+""+"block text-gray-700 text-sm font-bold mb-2"+""+>
          Product Images
        </label>
        <input
          type=+""+"file"+""+
          multiple
          accept=+""+"image/*"+""+
          onChange={handleImageChange}
          className=+""+"w-full px-3 py-2 border border-gray-300 rounded-lg"+""+
        />
      </div>
      
      {formData.images.length > 0 && (
        <div className=+""+"mb-4"+""+>
          <p className=+""+"text-sm text-gray-600 mb-2"+""+>Current Images:</p>
          <div className=+""+"flex space-x-2"+""+>
            {formData.images.map((img, idx) => (
              <img key={idx} src={img} alt=+""+"Product"+""+ className=+""+"w-20 h-20 object-cover rounded"+""+ />
            ))}
          </div>
        </div>
      )}
      
      <div className=+""+"flex space-x-4"+""+>
        <Button type=+""+"submit"+""+ disabled={loading}>
          {loading ? 'Saving...' : (productId ? 'Update Product' : 'Create Product')}
        </Button>
        {onSuccess && (
          <Button type=+""+"button"+""+ variant=+""+"secondary"+""+ onClick={onSuccess}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;