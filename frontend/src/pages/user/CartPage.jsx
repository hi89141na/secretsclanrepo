import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart.find(item => item._id === productId);
    if (item && newQuantity > item.stock) {
      toast.error(`Only ${item.stock} items available in stock`);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some products to get started!</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <Link to={`/products/${item._id}`}>
                  <img
                    src={item.images?.[0] || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <Link 
                    to={`/products/${item._id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                  >
                    {item.name}
                  </Link>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center border-x border-gray-300 py-1 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                      {item.stock < 10 && item.stock > 0 && (
                        <span className="text-xs text-orange-500">
                          Only {item.stock} left
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium mt-3"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart Button */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your cart?')) {
                  clearCart();
                }
              }}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear Cart
            </button>
            <Link to="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cart.length}):</span>
                <span>{cart.reduce((total, item) => total + item.quantity, 0)} products</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium">${getCartTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span className="font-medium">
                  {getCartTotal() > 50 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    '$5.00'
                  )}
                </span>
              </div>
              
              {getCartTotal() <= 50 && (
                <p className="text-sm text-gray-500">
                  Add ${(50 - getCartTotal()).toFixed(2)} more for free shipping!
                </p>
              )}
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-indigo-600">
                  ${(getCartTotal() + (getCartTotal() > 50 ? 0 : 5)).toFixed(2)}
                </span>
              </div>
            </div>

            <Button fullWidth onClick={handleCheckout}>
              Proceed to Checkout
            </Button>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Secure checkout
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Easy returns within 30 days
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;