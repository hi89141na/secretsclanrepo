const fs = require('fs');

const content = String.raw`import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';
import { motion } from 'framer-motion';

const ProductCard = ({ product, showOfferPrice = false }) => {
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/300';

  const hasOfferPrice = showOfferPrice && product.discountedPrice !== undefined && product.originalPrice;
  
  const now = new Date();
  const saleStart = product.saleStartDate ? new Date(product.saleStartDate) : null;
  const saleEnd = product.saleEndDate ? new Date(product.saleEndDate) : null;
  
  const isOnSale = !hasOfferPrice && product.salePrice && 
                   product.salePrice < product.price &&
                   (!saleStart || now >= saleStart) && 
                   (!saleEnd || now <= saleEnd);
  
  let displayPrice = product.price;
  let originalPrice = null;
  let discountPercentage = 0;
  let priceLabel = null;
  
  if (hasOfferPrice) {
    displayPrice = product.discountedPrice;
    originalPrice = product.originalPrice;
    discountPercentage = Math.round((1 - displayPrice / originalPrice) * 100);
    priceLabel = 'OFFER';
  } else if (isOnSale) {
    displayPrice = product.salePrice;
    originalPrice = product.price;
    discountPercentage = Math.round((1 - displayPrice / originalPrice) * 100);
    priceLabel = 'SALE';
  }
  
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 10;
  const hasDiscount = hasOfferPrice || isOnSale;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className={` + '`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 ${isOutOfStock ? ' + "'" + 'opacity-75' + "'" + ' : ' + "'" + "'" + '}`' + `}>
      <Link to={` + '`/products/${product._id}`' + `} className="block relative overflow-hidden aspect-[4/3]">
        {hasDiscount && !isOutOfStock && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: -12 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className={` + '`absolute top-3 left-3 z-10 ${hasOfferPrice ? ' + "'" + 'bg-gradient-to-r from-purple-600 to-pink-600' + "'" + ' : ' + "'" + 'bg-gradient-to-r from-red-500 to-pink-500' + "'" + '} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg`' + `}>
            {priceLabel}
          </motion.div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-2 rounded-full font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        <img
          src={imageUrl}
          alt={product.name}
          className={` + '`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? ' + "'" + 'opacity-100 scale-100' + "'" + ' : ' + "'" + 'opacity-0 scale-95' + "'" + '} group-hover:scale-110`' + `}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-5">
        <Link to={` + '`/products/${product._id}`' + `}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {product.description}
        </p>

        <div className="flex items-end justify-between mb-4">
          <div>
            {hasDiscount ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className={` + '`text-2xl font-bold ${hasOfferPrice ? ' + "'" + 'text-purple-600 dark:text-purple-400' + "'" + ' : ' + "'" + 'text-red-600 dark:text-red-400' + "'" + '}`' + `}>
                    Rs. {displayPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    Rs. {originalPrice.toFixed(2)}
                  </span>
                </div>
                <span className={` + '`text-xs font-semibold ${hasOfferPrice ? ' + "'" + 'text-purple-600 dark:text-purple-400' + "'" + ' : ' + "'" + 'text-red-600 dark:text-red-400' + "'" + '}`' + `}>
                  Save {discountPercentage}%
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Rs. {product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {isLowStock && !isOutOfStock && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-orange-500 dark:text-orange-400 text-xs font-medium mb-3 flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            Only {product.stock} left in stock!
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}>
          <Button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            fullWidth
            size="md"
            className="relative overflow-hidden">
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}>
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </motion.span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
`;

fs.writeFileSync('frontend/src/components/product/ProductCard.jsx', content, 'utf8');
console.log('✅ Step 7/10: Updated frontend/src/components/product/ProductCard.jsx\n');
