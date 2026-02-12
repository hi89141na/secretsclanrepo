import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders();
      const ordersData = response.data || response;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderAPI.cancel(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-200 dark:border-gray-700 transition-colors">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
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
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to see your orders here!</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order #{order._id?.slice(-8)}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                    Rs. {order.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Items ({order.orderItems?.length || 0})</h4>
                <div className="space-y-2">
                  {order.orderItems?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name || 'Product'}</p>
                          <p className="text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">Rs. {item.price?.toFixed(2)}</p>
                    </div>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">+ {order.orderItems.length - 3} more items</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <h4 className="font-medium mb-1 text-gray-900 dark:text-white">Shipping Address</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {order.phone}</p>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Link to={`/orders/${order._id}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
                
                {order.orderStatus === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelOrder(order._id)}
                    className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Cancel Order
                  </Button>
                )}
                
                {order.orderStatus === 'delivered' && order.orderItems?.[0]?.productId && (
                  <Link to={`/products/${order.orderItems[0].productId}`}>
                    <Button size="sm">Leave Review</Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
