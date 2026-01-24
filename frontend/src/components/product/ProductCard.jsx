import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const imageUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/300';

  // Check if product has valid sale price
  console.log("Product:", product.name, "| Price:", product.price, "| SalePrice:", product.salePrice);
  console.log("Dates - Start:", product.saleStartDate, "End:", product.saleEndDate);
  
  const now = new Date();
  const saleStart = product.saleStartDate ? new Date(product.saleStartDate) : null;
  const saleEnd = product.saleEndDate ? new Date(product.saleEndDate) : null;
  
  const isOnSale = product.salePrice && 
                   product.salePrice < product.price &&
                   (!saleStart || now >= saleStart) && 
                   (!saleEnd || now <= saleEnd);
                   
  console.log("IsOnSale:", isOnSale, "| Now:", now.toISOString());
  if (saleStart) console.log("Start:", saleStart.toISOString(), "| Now >= Start:", now >= saleStart);
  if (saleEnd) console.log("End:", saleEnd.toISOString(), "| Now <= End:", now <= saleEnd);
  
  const displayPrice = isOnSale ? product.salePrice : product.price;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id}`}>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
        />
      </Link>
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4 flex justify-between items-center">
          <div>
            {isOnSale ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-red-600">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded mt-1 w-fit">
                  SALE
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-indigo-600">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            size="sm"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
        {product.stock > 0 && product.stock < 10 && (
          <p className="text-orange-500 text-xs mt-2">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
