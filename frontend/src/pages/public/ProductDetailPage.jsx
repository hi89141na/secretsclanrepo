import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ReviewList from '../../components/product/ReviewList';
import ReviewForm from '../../components/product/ReviewForm';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import OfferBanner from '../../components/common/OfferBanner';
import { Tag, Sparkles } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getByProduct(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!product) return <div className="container mx-auto px-4 py-8">Product not found</div>;

  const hasOfferPrice = product.discountedPrice && product.originalPrice && product.appliedOffer;
  
  const now = new Date();
  const saleStart = product.saleStartDate ? new Date(product.saleStartDate) : null;
  const saleEnd = product.saleEndDate ? new Date(product.saleEndDate) : null;
  const isOnSale = !hasOfferPrice && product.salePrice && product.salePrice < product.price && 
                   (!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd);

  let displayPrice = product.price;
  let originalPrice = null;
  let discountPercentage = 0;
  let priceLabel = null;
  let priceColor = 'indigo-600 dark:text-indigo-400';

  if (hasOfferPrice) {
    displayPrice = product.discountedPrice;
    originalPrice = product.originalPrice;
    discountPercentage = Math.round((1 - displayPrice / originalPrice) * 100);
    priceLabel = 'OFFER';
    priceColor = 'purple-600 dark:text-purple-400';
  } else if (isOnSale) {
    displayPrice = product.salePrice;
    originalPrice = product.price;
    discountPercentage = Math.round((1 - displayPrice / originalPrice) * 100);
    priceLabel = 'SALE';
    priceColor = 'red-600 dark:text-red-400';
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <OfferBanner />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <ProductImageGallery images={product.images} />
          
          <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{product.name}</h1>
            
            {(hasOfferPrice || isOnSale) && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm shadow-md ${hasOfferPrice ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'}`}>
                    {hasOfferPrice ? <Sparkles className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                    <span>{priceLabel} - SAVE {discountPercentage}%</span>
                  </div>
                </div>
                
                {hasOfferPrice && product.appliedOffer && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-3 mb-3">
                    <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {product.appliedOffer.title}
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Auto-applied: {product.appliedOffer.discountType === 'percentage' 
                        ? `${product.appliedOffer.discountValue}% off`
                        : `Rs. ${product.appliedOffer.discountValue} off`}
                    </p>
                  </div>
                )}
                
                <div className="flex items-baseline gap-3">
                  <p className={`text-4xl font-bold text-${priceColor}`}>
                    Rs. {displayPrice.toFixed(2)}
                  </p>
                  {originalPrice && (
                    <p className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                      Rs. {originalPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {!hasOfferPrice && !isOnSale && (
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
                Rs. {product.price.toFixed(2)}
              </p>
            )}
            
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
            
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <Button onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReviewList reviews={reviews} />
            </div>
            <div>
              {user ? (
                <ReviewForm productId={id} onReviewSubmitted={fetchReviews} />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400">Please login to write a review</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
