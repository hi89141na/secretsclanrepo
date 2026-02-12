import React, { useState, useEffect } from 'react';
import { emailAPI, offerAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SendEmailPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    includeOffer: false,
    selectedOffer: '',
  });

  useEffect(() => {
    fetchActiveOffers();
  }, []);

  const fetchActiveOffers = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getAll();
      const offersData = response.data?.data || response.data || [];
      const activeOffers = offersData.filter(offer => offer.isActive);
      setOffers(Array.isArray(activeOffers) ? activeOffers : []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch offers');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    if (formData.includeOffer && !formData.selectedOffer) {
      toast.error('Please select an offer');
      return;
    }

    if (!window.confirm('Are you sure you want to send this email to all users?')) {
      return;
    }

    try {
      setSending(true);
      const emailData = {
        subject: formData.subject,
        message: formData.message,
        offerId: formData.includeOffer ? formData.selectedOffer : null,
      };

      const response = await emailAPI.sendBulk(emailData);
      const sentCount = response.data?.sentCount || response.data?.count || 0;
      
      toast.success(Email sent successfully to  users!);
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
        includeOffer: false,
        selectedOffer: '',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const getSelectedOfferDetails = () => {
    if (!formData.selectedOffer) return null;
    return offers.find(offer => offer._id === formData.selectedOffer);
  };

  const selectedOfferDetails = getSelectedOfferDetails();

  if (loading) {
    return (
      <div className=\"flex justify-center items-center min-h-screen\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600\"></div>
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"bg-white rounded-lg shadow-md p-6\">
        <div className=\"mb-6\">
          <h1 className=\"text-3xl font-bold text-gray-900\">Send Bulk Email</h1>
          <p className=\"text-sm text-gray-600 dark:text-gray-400 mt-2\">Send promotional emails to all registered users</p>
        </div>

        <form onSubmit={handleSendEmail}>
          <div className=\"grid grid-cols-1 gap-6\">
            {/* Subject */}
            <div>
              <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                Email Subject *
              </label>
              <input
                type=\"text\"
                name=\"subject\"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder=\"Enter email subject\"
                className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                Email Message *
              </label>
              <textarea
                name=\"message\"
                value={formData.message}
                onChange={handleInputChange}
                rows=\"8\"
                placeholder=\"Enter your email message here...\"
                className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                required
              />
            </div>

            {/* Include Offer */}
            <div className=\"flex items-center\">
              <input
                type=\"checkbox\"
                name=\"includeOffer\"
                checked={formData.includeOffer}
                onChange={handleInputChange}
                className=\"h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded\"
              />
              <label className=\"ml-2 block text-sm text-gray-900\">
                Include special offer in email
              </label>
            </div>

            {/* Offer Select */}
            {formData.includeOffer && (
              <div>
                <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                  Select Offer *
                </label>
                <select
                  name=\"selectedOffer\"
                  value={formData.selectedOffer}
                  onChange={handleInputChange}
                  className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                  required={formData.includeOffer}
                >
                  <option value=\"\">-- Select an offer --</option>
                  {offers && offers.length > 0 ? (
                    offers.map((offer) => (
                      <option key={offer._id} value={offer._id}>
                        {offer.title} - {offer.discountType === 'percentage' ? ${offer.discountValue}% : \import React, { useState, useEffect } from 'react';
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
      toast.success(Offer ${!offer.isActive ? 'activated' : 'deactivated'} successfully);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    return ${start} - ${end};
  };

  if (loading) {
    return (
      <div className=\"flex justify-center items-center min-h-screen\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600\"></div>
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"bg-white rounded-lg shadow-md p-6\">
        <div className=\"flex justify-between items-center mb-6\">
          <h1 className=\"text-3xl font-bold text-gray-900\">Manage Offers</h1>
          <button
            onClick={handleAdd}
            className=\"bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded\"
          >
            Add Offer
          </button>
        </div>

        <div className=\"overflow-x-auto\">
          <table className=\"min-w-full divide-y divide-gray-200\">
            <thead className=\"bg-gray-50\">
              <tr>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Title
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Type
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Value
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Date Range
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Status
                </th>
                <th className=\"px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className=\"bg-white divide-y divide-gray-200\">
              {offers && offers.length > 0 ? (
                offers.map((offer) => (
                  <tr key={offer._id} className=\"hover:bg-gray-50\">
                    <td className=\"px-6 py-4\">
                      <div className=\"text-sm font-medium text-gray-900\">{offer.title}</div>
                      <div className=\"text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs\">
                        {offer.description}
                      </div>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <span className=\"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200\">
                        {offer.discountType}
                      </span>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900\">
                      {offer.discountType === 'percentage' ? ${offer.discountValue}% : \$${offer.discountValue}}
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400\">
                      {formatDateRange(offer.startDate, offer.endDate)}
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <span
                        className={px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          offer.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-gray-100 text-gray-800'
                        }}
                      >
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-right text-sm font-medium\">
                      <button
                        onClick={() => handleEdit(offer)}
                        className=\"text-indigo-600 hover:text-indigo-900 mr-4\"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(offer)}
                        className=\"text-yellow-600 hover:text-yellow-900 mr-4\"
                      >
                        {offer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className=\"text-red-600 hover:text-red-900\"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan=\"6\" className=\"text-center py-8 text-gray-500 dark:text-gray-400\">
                    No offers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className=\"fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-80 overflow-y-auto h-full w-full z-50\">
          <div className=\"relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-10\">
            <div className=\"mt-3\">
              <h3 className=\"text-lg leading-6 font-medium text-gray-900 mb-4\">
                {selectedOffer ? 'Edit Offer' : 'Add Offer'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Title
                    </label>
                    <input
                      type=\"text\"
                      name=\"title\"
                      value={formData.title}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    />
                  </div>

                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Description
                    </label>
                    <textarea
                      name=\"description\"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows=\"3\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Discount Type
                    </label>
                    <select
                      name=\"discountType\"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    >
                      <option value=\"percentage\">Percentage</option>
                      <option value=\"fixed\">Fixed</option>
                    </select>
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Discount Value
                    </label>
                    <input
                      type=\"number\"
                      name=\"discountValue\"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      step=\"0.01\"
                      min=\"0\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Start Date
                    </label>
                    <input
                      type=\"datetime-local\"
                      name=\"startDate\"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      End Date
                    </label>
                    <input
                      type=\"datetime-local\"
                      name=\"endDate\"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Min Purchase Amount (\$) <span className=\"text-gray-500 dark:text-gray-400 font-normal text-xs\">(Optional)</span>
                    </label>
                    <input
                      type=\"number\"
                      name=\"minPurchaseAmount\"
                      value={formData.minPurchaseAmount}
                      onChange={handleInputChange}
                      step=\"0.01\"
                      min=\"0\"
                      placeholder=\"Leave empty if no minimum\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Max Discount Amount (\$) <span className=\"text-gray-500 dark:text-gray-400 font-normal text-xs\">(Optional)</span>
                    </label>
                    <input
                      type=\"number\"
                      name=\"maxDiscountAmount\"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      step=\"0.01\"
                      min=\"0\"
                      placeholder=\"Leave empty if no maximum\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Applicable Products
                    </label>
                    <div className=\"border rounded p-3 max-h-40 overflow-y-auto bg-gray-50\">
                      {products && products.length > 0 ? (
                        products.map((product) => (
                          <div key={product._id} className=\"flex items-center mb-2\">
                            <input
                              type=\"checkbox\"
                              checked={formData.applicableProducts.includes(product._id)}
                              onChange={() => handleProductToggle(product._id)}
                              className=\"h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded\"
                            />
                            <label className=\"ml-2 block text-sm text-gray-900\">
                              {product.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className=\"text-sm text-gray-500 dark:text-gray-400\">No products available</p>
                      )}
                    </div>
                  </div>

                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Applicable Categories
                    </label>
                    <div className=\"border rounded p-3 max-h-40 overflow-y-auto bg-gray-50\">
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <div key={category._id} className=\"flex items-center mb-2\">
                            <input
                              type=\"checkbox\"
                              checked={formData.applicableCategories.includes(category._id)}
                              onChange={() => handleCategoryToggle(category._id)}
                              className=\"h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded\"
                            />
                            <label className=\"ml-2 block text-sm text-gray-900\">
                              {category.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className=\"text-sm text-gray-500 dark:text-gray-400\">No categories available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className=\"flex items-center justify-end space-x-2 mt-6\">
                  <button
                    type=\"button\"
                    onClick={() => setShowModal(false)}
                    className=\"bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline\"
                  >
                    Cancel
                  </button>
                  <button
                    type=\"submit\"
                    className=\"bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline\"
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

export default ManageOffersPage;{offer.discountValue}} off
                      </option>
                    ))
                  ) : (
                    <option disabled>No active offers available</option>
                  )}
                </select>
              </div>
            )}

            {/* Email Preview */}
            <div className=\"border-t pt-6\">
              <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Email Preview</h3>
              <div className=\"bg-gray-50 border rounded p-6\">
                <div className=\"mb-4\">
                  <p className=\"text-xs text-gray-500 dark:text-gray-400 uppercase mb-1\">Subject:</p>
                  <p className=\"text-lg font-semibold text-gray-900\">
                    {formData.subject || '(No subject)'}
                  </p>
                </div>

                <div className=\"border-t pt-4\">
                  <div className=\"prose max-w-none\">
                    <p className=\"text-gray-700 dark:text-gray-300 whitespace-pre-wrap\">
                      {formData.message || '(No message)'}
                    </p>
                  </div>

                  {formData.includeOffer && selectedOfferDetails && (
                    <div className=\"mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded\">
                      <h4 className=\"text-lg font-bold text-indigo-900 mb-2\">
                        {selectedOfferDetails.title}
                      </h4>
                      <p className=\"text-sm text-indigo-700 mb-2\">
                        {selectedOfferDetails.description}
                      </p>
                      <div className=\"flex items-center gap-4 text-sm\">
                        <span className=\"font-semibold text-indigo-900\">
                          {selectedOfferDetails.discountType === 'percentage' 
                            ? ${selectedOfferDetails.discountValue}% OFF 
                            : \import React, { useState, useEffect } from 'react';
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
      toast.success(Offer ${!offer.isActive ? 'activated' : 'deactivated'} successfully);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    return ${start} - ${end};
  };

  if (loading) {
    return (
      <div className=\"flex justify-center items-center min-h-screen\">
        <div className=\"animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600\"></div>
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"bg-white rounded-lg shadow-md p-6\">
        <div className=\"flex justify-between items-center mb-6\">
          <h1 className=\"text-3xl font-bold text-gray-900\">Manage Offers</h1>
          <button
            onClick={handleAdd}
            className=\"bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded\"
          >
            Add Offer
          </button>
        </div>

        <div className=\"overflow-x-auto\">
          <table className=\"min-w-full divide-y divide-gray-200\">
            <thead className=\"bg-gray-50\">
              <tr>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Title
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Type
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Value
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Date Range
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Status
                </th>
                <th className=\"px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider\">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className=\"bg-white divide-y divide-gray-200\">
              {offers && offers.length > 0 ? (
                offers.map((offer) => (
                  <tr key={offer._id} className=\"hover:bg-gray-50\">
                    <td className=\"px-6 py-4\">
                      <div className=\"text-sm font-medium text-gray-900\">{offer.title}</div>
                      <div className=\"text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs\">
                        {offer.description}
                      </div>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <span className=\"px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200\">
                        {offer.discountType}
                      </span>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900\">
                      {offer.discountType === 'percentage' ? ${offer.discountValue}% : \$${offer.discountValue}}
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400\">
                      {formatDateRange(offer.startDate, offer.endDate)}
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <span
                        className={px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          offer.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-gray-100 text-gray-800'
                        }}
                      >
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-right text-sm font-medium\">
                      <button
                        onClick={() => handleEdit(offer)}
                        className=\"text-indigo-600 hover:text-indigo-900 mr-4\"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(offer)}
                        className=\"text-yellow-600 hover:text-yellow-900 mr-4\"
                      >
                        {offer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id)}
                        className=\"text-red-600 hover:text-red-900\"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan=\"6\" className=\"text-center py-8 text-gray-500 dark:text-gray-400\">
                    No offers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className=\"fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-80 overflow-y-auto h-full w-full z-50\">
          <div className=\"relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-10\">
            <div className=\"mt-3\">
              <h3 className=\"text-lg leading-6 font-medium text-gray-900 mb-4\">
                {selectedOffer ? 'Edit Offer' : 'Add Offer'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Title
                    </label>
                    <input
                      type=\"text\"
                      name=\"title\"
                      value={formData.title}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    />
                  </div>

                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Description
                    </label>
                    <textarea
                      name=\"description\"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows=\"3\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Discount Type
                    </label>
                    <select
                      name=\"discountType\"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    >
                      <option value=\"percentage\">Percentage</option>
                      <option value=\"fixed\">Fixed</option>
                    </select>
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Discount Value
                    </label>
                    <input
                      type=\"number\"
                      name=\"discountValue\"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      step=\"0.01\"
                      min=\"0\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                      required
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Start Date
                    </label>
                    <input
                      type=\"datetime-local\"
                      name=\"startDate\"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      End Date
                    </label>
                    <input
                      type=\"datetime-local\"
                      name=\"endDate\"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Min Purchase Amount (\$) <span className=\"text-gray-500 dark:text-gray-400 font-normal text-xs\">(Optional)</span>
                    </label>
                    <input
                      type=\"number\"
                      name=\"minPurchaseAmount\"
                      value={formData.minPurchaseAmount}
                      onChange={handleInputChange}
                      step=\"0.01\"
                      min=\"0\"
                      placeholder=\"Leave empty if no minimum\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div>
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Max Discount Amount (\$) <span className=\"text-gray-500 dark:text-gray-400 font-normal text-xs\">(Optional)</span>
                    </label>
                    <input
                      type=\"number\"
                      name=\"maxDiscountAmount\"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      step=\"0.01\"
                      min=\"0\"
                      placeholder=\"Leave empty if no maximum\"
                      className=\"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline\"
                    />
                  </div>

                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Applicable Products
                    </label>
                    <div className=\"border rounded p-3 max-h-40 overflow-y-auto bg-gray-50\">
                      {products && products.length > 0 ? (
                        products.map((product) => (
                          <div key={product._id} className=\"flex items-center mb-2\">
                            <input
                              type=\"checkbox\"
                              checked={formData.applicableProducts.includes(product._id)}
                              onChange={() => handleProductToggle(product._id)}
                              className=\"h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded\"
                            />
                            <label className=\"ml-2 block text-sm text-gray-900\">
                              {product.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className=\"text-sm text-gray-500 dark:text-gray-400\">No products available</p>
                      )}
                    </div>
                  </div>

                  <div className=\"md:col-span-2\">
                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">
                      Applicable Categories
                    </label>
                    <div className=\"border rounded p-3 max-h-40 overflow-y-auto bg-gray-50\">
                      {categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <div key={category._id} className=\"flex items-center mb-2\">
                            <input
                              type=\"checkbox\"
                              checked={formData.applicableCategories.includes(category._id)}
                              onChange={() => handleCategoryToggle(category._id)}
                              className=\"h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded\"
                            />
                            <label className=\"ml-2 block text-sm text-gray-900\">
                              {category.name}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className=\"text-sm text-gray-500 dark:text-gray-400\">No categories available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className=\"flex items-center justify-end space-x-2 mt-6\">
                  <button
                    type=\"button\"
                    onClick={() => setShowModal(false)}
                    className=\"bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline\"
                  >
                    Cancel
                  </button>
                  <button
                    type=\"submit\"
                    className=\"bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline\"
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

export default ManageOffersPage;{selectedOfferDetails.discountValue} OFF}
                        </span>
                        {selectedOfferDetails.endDate && (
                          <span className=\"text-indigo-600\">
                            Valid until: {new Date(selectedOfferDetails.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className=\"mt-6 text-xs text-gray-500 dark:text-gray-400 border-t pt-4\">
                    <p>This email was sent from SecretsClan. You're receiving this because you're a registered user.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className=\"flex justify-end\">
              <button
                type=\"submit\"
                disabled={sending}
                className={${
                  sending 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline flex items-center gap-2}
              >
                {sending ? (
                  <>
                    <div className=\"animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white\"></div>
                    Sending...
                  </>
                ) : (
                  'Send to All Users'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmailPage;

