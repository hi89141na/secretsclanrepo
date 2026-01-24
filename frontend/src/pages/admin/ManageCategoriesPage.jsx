import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI, uploadAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const categoriesData = Array.isArray(response) ? response : (response.data || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await uploadAPI.uploadCategoryImage(formData);
      const imageUrl = response.data?.url || response.url;
      setFormData(prev => ({ ...prev, image: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryAPI.create(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', image: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <div className="flex gap-3">
          <Button onClick={() => setShowModal(true)}>Add Category</Button>
          <Link to="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {category.image && (
              <img src={category.image} alt={category.name} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{category.description || 'No description'}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(category)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(category._id)} className="text-red-600 border-red-600 hover:bg-red-50">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <Input
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" fullWidth disabled={uploading}>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" fullWidth onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategoriesPage;