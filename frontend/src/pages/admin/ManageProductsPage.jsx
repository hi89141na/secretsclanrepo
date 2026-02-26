import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, uploadAPI } from '../../services/api';
import { toast } from 'react-toastify';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
const ManageProductsPage = () => {
  const { confirmState, showConfirm, handleConfirm, handleCancel } = useConfirm();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    featured: false,
    salePrice: '',
    saleStartDate: '',
    saleEndDate: '',
  });

  // Placeholder image as base64
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2RkZCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      const productsData = response.data?.data || response.data || [];
      console.log('Products data:', productsData);
      productsData.forEach((p, i) => console.log('Product ' + (i + 1) + ': ' + p.name + ' - Image: ' + (p.image ? p.image.substring(0, 100) + '...' : 'NO IMAGE')));
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const categoriesData = Array.isArray(response) ? response : (response?.data || []);
      console.log('Categories loaded:', categoriesData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
    }
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      featured: false,
      salePrice: '',
      saleStartDate: '',
      saleEndDate: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || '',
      stock: product.stock,
      image: product.image,
      featured: product.featured || false,
      salePrice: product.salePrice || '',
      saleStartDate: product.saleStartDate ? product.saleStartDate.split('T')[0] : '',
      saleEndDate: product.saleEndDate ? product.saleEndDate.split('T')[0] : '',
    });
    setImagePreview(product.images?.[0] || product.image || placeholderImage);
    setImageFile(null);
    setShowModal(true);
  };

 const handleDelete = async (id) => {
  const confirmed = await showConfirm({
    title: 'Delete Product?',
    message: 'Are you sure you want to delete this product? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await productAPI.delete(id);
    toast.success('Product deleted successfully');
    fetchProducts();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete product');
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);
        const uploadResponse = await uploadAPI.uploadImage(formDataImg);
        imageUrl = uploadResponse.data.url;
      }

      const productData = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price),
        stock: Number(formData.stock),
        featured: formData.featured,
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        saleStartDate: formData.saleStartDate || null,
        saleEndDate: formData.saleEndDate || null,
      };

      if (selectedProduct) {
        await productAPI.update(selectedProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(productData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleRemoveSale = () => {
    setFormData((prev) => ({
      ...prev,
      salePrice: '',
      saleStartDate: '',
      saleEndDate: ''
    }));
  };


  const handleImageError = (e) => {
    e.target.src = placeholderImage;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Products</h1>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={product.images?.[0] || product.image || placeholderImage}
                        alt={product.name}
                        className="h-12 w-12 rounded object-cover"
                        onError={handleImageError}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        {product.featured && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            Featured
                          </span>
                        )}
                        {product.salePrice && product.salePrice < product.price && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                          Sale
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {product.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.salePrice && product.salePrice < product.price ? (
                        <div>
                          <div className="text-gray-900 font-semibold">Rs. {product.salePrice.toFixed(2)}</div>
                          <div className="text-gray-500 dark:text-gray-400 line-through text-xs">Rs. {product.price.toFixed(2)}</div>
                        </div>
                      ) : (
                        <div className="text-gray-900 dark:text-white">Rs. {product.price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full Rs. ${
                          product.stock > 10
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : product.stock > 0
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

            {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {selectedProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Product Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Price (Rs.)"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Stock"
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories && categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No categories available</option>
                    )}
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-white font-semibold">
                    Featured Product
                  </label>
                </div>

                {/* Sale Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sale Information (Optional)</h3>
                </div>

                <div>
                  <Input
                    label="Sale Price (Rs.)"
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    placeholder="Leave empty if no sale"
                  />
                </div>

                <div className="flex items-end">
                  {(formData.salePrice || formData.saleStartDate || formData.saleEndDate) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveSale}
                      fullWidth
                      className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      ✕ Remove Sale
                    </Button>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Sale Start Date
                  </label>
                  <input
                    type="date"
                    name="saleStartDate"
                    value={formData.saleStartDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Sale End Date
                  </label>
                  <input
                    type="date"
                    name="saleEndDate"
                    value={formData.saleEndDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 h-40 w-40 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      onError={handleImageError}
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="submit" fullWidth>
                  {selectedProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" fullWidth onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
      />
    </div>
  );
};

export default ManageProductsPage;


















