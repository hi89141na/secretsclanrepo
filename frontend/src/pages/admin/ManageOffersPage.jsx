import React, { useState, useEffect } from 'react';
import { offerAPI, productAPI, categoryAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ManageOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    applicableProducts: [],
    applicableCategories: [],
  });

  useEffect(() => {
    fetchOffers();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getAll();
      const offersData = response.data?.data || response.data || [];
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      const productsData = response.data?.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch products');
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const categoriesData = Array.isArray(response) ? response : (response?.data || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
    }
  };

  const handleAdd = () => {
    setSelectedOffer(null);
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      minPurchaseAmount: '',
      maxDiscountAmount: '',
      applicableProducts: [],
      applicableCategories: [],
      scope: 'products',
    });
    setShowModal(true);
  };

  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 16) : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 16) : '',
      minPurchaseAmount: offer.minPurchaseAmount || '',
      maxDiscountAmount: offer.maxDiscountAmount || '',
      applicableProducts: offer.applicableProducts?.map(p => p._id || p) || [],
      applicableCategories: offer.applicableCategories?.map(c => c._id || c) || [],
      scope: offer.scope || 'products',
    });
    setShowModal(true);
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await offerAPI.delete(offerId);
      toast.success('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete offer');
    }
  };

  const handleToggle = async (offer) => {
    try {
      await offerAPI.update(offer._id, { isActive: !offer.isActive });
      toast.success(`Offer ${offer.isActive ? "disabled" : "enabled"} successfully`);
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle offer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const offerData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      if (selectedOffer) {
        await offerAPI.update(selectedOffer._id, offerData);
        toast.success('Offer updated successfully');
      } else {
        await offerAPI.create(offerData);
        toast.success('Offer created successfully');
      }

      setShowModal(false);
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save offer');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, ...(name==='scope' && value==='entire_store' ? { applicableProducts: [], applicableCategories: [] } : {}) }));
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter(id => id !== productId)
        : [...prev.applicableProducts, productId]
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(categoryId)
        ? prev.applicableCategories.filter(id => id !== categoryId)
        : [...prev.applicableCategories, categoryId]
    }));
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return 'N/A';
    const start = startDate ? new Date(startDate).toLocaleDateString() : 'N/A';
    const end = endDate ? new Date(endDate).toLocaleDateString() : 'N/A';
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Offers</h1>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Offer
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Scope</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {offers && offers.length > 0 ? (
                offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{offer.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {offer.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {offer.discountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateRange(offer.startDate, offer.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={offer.scope==='entire_store'?'px-2 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200':offer.scope==='categories'?'px-2 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200':'px-2 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'}>
                        {offer.scope==='entire_store'?'Entire Store':offer.scope==='categories'?'Categories':'Products'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          offer.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(offer)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-4"
                      >
                        {offer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No offers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-80 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 mb-10">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                {selectedOffer ? 'Edit Offer' : 'Add Offer'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Offer Scope</label>
                    <div className="flex flex-wrap gap-4 p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
                      {[['entire_store','Entire Store'],['categories','Categories'],['products','Products']].map(([val,lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer text-gray-900 dark:text-gray-300">
                          <input type="radio" name="scope" value={val} checked={formData.scope===val} onChange={handleInputChange} className="text-indigo-600" />
                          {lbl}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Discount Type
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Min Purchase Amount ($) <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      name="minPurchaseAmount"
                      value={formData.minPurchaseAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="Leave empty if no minimum"
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Max Discount Amount ($) <span className="text-gray-500 dark:text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="Leave empty if no maximum"
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>

                  {formData.scope==='products' && <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Applicable Products
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                      {products && products.length > 0 ? (
                        products.map((product) => (
                          <div key={product._id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={formData.applicableProducts.includes(product._id)}
                              onChange={() => handleProductToggle(product._id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                              {product.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No products available</p>
                      )}
                    </div>
                  </div>}

                  {formData.scope==='categories' && <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Applicable Categories
                    </label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <div key={category._id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={formData.applicableCategories.includes(category._id)}
                              onChange={() => handleCategoryToggle(category._id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                              {category.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No categories available</p>
                      )}
                    </div>
                  </div>}
                </div>

                <div className="flex items-center justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {selectedOffer ? 'Update Offer' : 'Create Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOffersPage;