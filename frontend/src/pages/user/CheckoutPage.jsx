import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { orderAPI } from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const { cart, clearCart, getCartTotal, getEffectivePrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: user?.address || '',
    city: '',
    province: '',
    zipCode: '',
    country: '',
    phone: user?.phone || ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const shippingCost = getCartTotal() > 50 ? 0 : 5;
  const taxAmount = getCartTotal() * 0.1;
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
        price: getEffectivePrice(item)
        })),
        shippingAddress,
        paymentMethod,
        totalAmount,
        shippingCost,
        taxAmount
      };

      await orderAPI.create(orderData);
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders/');
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Your cart is empty</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some products before checkout</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Shipping Address</h2>
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
                  label="Province"
                  name="province"
                  value={shippingAddress.province}
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

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pay securely with your card</p>
                  </div>
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </label>
                
                <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">PayPal</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pay with PayPal account</p>
                  </div>
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.162a.8.8 0 01-.791.679H7.723c-.304 0-.55-.267-.505-.577l.018-.095 1.85-11.72a.805.805 0 01.794-.68h2.632c1.76 0 3.143.385 4.05 1.117a3.412 3.412 0 01.505.446z" />
                  </svg>
                </label>
                
                <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Cash on Delivery</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pay when you receive</p>
                  </div>
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-start space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <img
                      src={item.images?.[0] || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Rs.{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Rs.{getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 dark:text-green-400">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax (10%):</span>
                  <span className="font-medium text-gray-900 dark:text-white">Rs.{taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">Rs.{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
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
