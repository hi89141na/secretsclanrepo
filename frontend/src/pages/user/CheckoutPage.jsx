import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { orderAPI } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: user?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phone: user?.phone || ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const shippingCost = getCartTotal() > 50 ? 0 : 5;
  const taxAmount = getCartTotal() * 0.1; // 10% tax
  const totalAmount = getCartTotal() + shippingCost + taxAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        totalAmount,
        shippingCost,
        taxAmount
      };

      const response = await orderAPI.create(orderData);
      const order = response.data || response;
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate(/orders/);
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add some products before checkout</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Shipping and Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Full Name"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <Input
                  label="City"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="State"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="ZIP Code"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="Country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                />
                
                <div className="md:col-span-2">
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                  </div>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </label>
                
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">PayPal</p>
                    <p className="text-sm text-gray-600">Pay with PayPal account</p>
                  </div>
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.162a.8.8 0 01-.791.679H7.723c-.304 0-.55-.267-.505-.577l.018-.095 1.85-11.72a.805.805 0 01.794-.68h2.632c1.76 0 3.143.385 4.05 1.117a3.412 3.412 0 01.505.446z" />
                  </svg>
                </label>
                
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-start space-x-3 pb-3 border-b">
                    <img
                      src={item.images?.[0] || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-indigo-600">
                        
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium"></span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      $
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium"></span>
                </div>
                
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-indigo-600"></span>
                </div>
              </div>
              
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;