import React, { useState, useEffect } from 'react';
import { categoryAPI, uploadAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';

const CategoryForm = ({ categoryId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await categoryAPI.getById(categoryId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to fetch category');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;
      
      if (imageFile) {
        const formDataImage = new FormData();
        formDataImage.append('image', imageFile);
        const uploadResponse = await uploadAPI.uploadCategoryImage(formDataImage);
        imageUrl = uploadResponse.data.url;
      }

      const categoryData = { ...formData, image: imageUrl };
      
      if (categoryId) {
        await categoryAPI.update(categoryId, categoryData);
        toast.success('Category updated successfully!');
      } else {
        await categoryAPI.create(categoryData);
        toast.success('Category created successfully!');
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className=+""+"bg-white p-6 rounded-lg shadow-md"+""+>
      <h2 className=+""+"text-2xl font-bold mb-6"+""+>
        {categoryId ? 'Edit Category' : 'Create Category'}
      </h2>
      
      <Input
        label=+""+"Category Name"+""+
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
          rows={3}
          className=+""+"w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"+""+
          required
        />
      </div>
      
      <div className=+""+"mb-4"+""+>
        <label className=+""+"block text-gray-700 text-sm font-bold mb-2"+""+>
          Category Image
        </label>
        <input
          type=+""+"file"+""+
          accept=+""+"image/*"+""+
          onChange={handleImageChange}
          className=+""+"w-full px-3 py-2 border border-gray-300 rounded-lg"+""+
        />
      </div>
      
      {formData.image && (
        <div className=+""+"mb-4"+""+>
          <p className=+""+"text-sm text-gray-600 mb-2"+""+>Current Image:</p>
          <img src={formData.image} alt=+""+"Category"+""+ className=+""+"w-32 h-32 object-cover rounded"+""+ />
        </div>
      )}
      
      <div className=+""+"flex space-x-4"+""+>
        <Button type=+""+"submit"+""+ disabled={loading}>
          {loading ? 'Saving...' : (categoryId ? 'Update Category' : 'Create Category')}
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

export default CategoryForm;