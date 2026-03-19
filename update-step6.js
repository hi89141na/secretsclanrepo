const fs = require('fs');
const path = require('path');

console.log('🔧 Step 6/10: Creating OfferProductsPage...');

const dir = 'frontend/src/pages/public';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const content = String.raw`import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { offerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { motion } from 'framer-motion';
import ProductCard from '../../components/product/ProductCard';

const OfferProductsPage = () => {
  const { offerId } = useParams();
  const [loading, setLoading] = useState(true);
  const [offerData, setOfferData] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchOfferProducts();
  }, [offerId]);

  const fetchOfferProducts = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getOfferProducts(offerId);
      const data = response.data || response;
      
      setOfferData(data.offer);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching offer products:', error);
      toast.error(error.response?.data?.message || 'Failed to load offer products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  if (!offerData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offer not found</h2>
      </div>
    );
  }

  const getScopeLabel = () => {
    switch (offerData.scope) {
      case 'entire_store':
        return 'Store-Wide Offer';
      case 'categories':
        return 'Category Offer';
      case 'products':
        return 'Special Products';
      default:
        return 'Special Offer';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1 mb-4 text-sm font-semibold bg-white/20 rounded-full">
              {getScopeLabel()}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {offerData.title}
            </h1>
            <p className="text-xl mb-6 text-white/90">
              {offerData.description}
            </p>
            <div className="inline-flex items-center space-x-3 bg-white text-purple-600 px-6 py-3 rounded-full font-bold text-lg">
              <span>Save</span>
              <span className="text-2xl">
                {offerData.discountType === 'percentage' 
                  ? ` + '`${offerData.discountValue}%`' + ` 
                  : ` + '`Rs. ${offerData.discountValue}`' + `}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {products.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {products.length} Product{products.length !== 1 ? 's' : ''} on Offer
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Grab them before the offer ends!
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard product={product} showOfferPrice={true} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No products available for this offer at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferProductsPage;
`;

fs.writeFileSync('frontend/src/pages/public/OfferProductsPage.jsx', content, 'utf8');
console.log('✅ Step 6/10: Created frontend/src/pages/public/OfferProductsPage.jsx\n');
