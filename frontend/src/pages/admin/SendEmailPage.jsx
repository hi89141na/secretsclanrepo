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
      
      toast.success(`Email sent successfully to ${sentCount} users!`);
      
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Send Bulk Email</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Send promotional emails to all registered users</p>
        </div>

        <form onSubmit={handleSendEmail}>
          <div className="grid grid-cols-1 gap-6">
            {/* Subject */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter email subject"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Email Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="8"
                placeholder="Enter your email message here..."
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            {/* Include Offer */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="includeOffer"
                checked={formData.includeOffer}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Include special offer in email
              </label>
            </div>

            {/* Offer Select */}
            {formData.includeOffer && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Select Offer *
                </label>
                <select
                  name="selectedOffer"
                  value={formData.selectedOffer}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                  required={formData.includeOffer}
                >
                  <option value="">-- Select an offer --</option>
                  {offers && offers.length > 0 ? (
                    offers.map((offer) => (
                      <option key={offer._id} value={offer._id}>
                        {offer.title} - {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`} off
                      </option>
                    ))
                  ) : (
                    <option disabled>No active offers available</option>
                  )}
                </select>
              </div>
            )}

            {/* Email Preview */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h3>
              <div className="bg-gray-50 border rounded p-6">
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Subject:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.subject || '(No subject)'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {formData.message || '(No message)'}
                    </p>
                  </div>

                  {formData.includeOffer && selectedOfferDetails && (
                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded">
                      <h4 className="text-lg font-bold text-indigo-900 mb-2">
                        {selectedOfferDetails.title}
                      </h4>
                      <p className="text-sm text-indigo-700 mb-2">
                        {selectedOfferDetails.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-indigo-900">
                          {selectedOfferDetails.discountType === 'percentage' 
                            ? `${selectedOfferDetails.discountValue}% OFF` 
                            : `$${selectedOfferDetails.discountValue} OFF`}
                        </span>
                        {selectedOfferDetails.endDate && (
                          <span className="text-indigo-600">
                            Valid until: {new Date(selectedOfferDetails.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 border-t pt-4">
                    <p>This email was sent from SecretsClan. You're receiving this because you're a registered user.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className={`${
                  sending 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline flex items-center gap-2`}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
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