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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ProductImageGallery images={product.images} />
        
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {(() => {
            const now = new Date();
            const saleStart = product.saleStartDate ? new Date(product.saleStartDate) : null;
            const saleEnd = product.saleEndDate ? new Date(product.saleEndDate) : null;
            const isOnSale = product.salePrice && product.salePrice < product.price && (!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd);

            return isOnSale ? (
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-red-600">${product.salePrice.toFixed(2)}</p>
                  <p className="text-2xl text-gray-500 line-through">${product.price.toFixed(2)}</p>
                </div>
                <span className="inline-block bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded mt-2">ON SALE</span>
              </div>
            ) : (
              <p className="text-4xl font-bold text-indigo-600 mb-4">${product.price.toFixed(2)}</p>
            );
          })()}
          
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>
          
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <Button onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ReviewList reviews={reviews} />
          </div>
          <div>
            {user ? (
              <ReviewForm productId={id} onReviewSubmitted={fetchReviews} />
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600">Please login to write a review</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
