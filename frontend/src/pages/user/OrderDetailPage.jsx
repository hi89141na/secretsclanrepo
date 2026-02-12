import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderAPI.getById(id);
      const orderData = response.data || response;
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderAPI.cancel(id);
      toast.success('Order cancelled successfully');
      navigate('/orders');
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loader fullScreen />;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Order not found</h3>
          <Link to="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/orders" className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
          ← Back to Orders
        </Link>
        <div className="flex flex-wrap justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Order #{order._id?.slice(-8)}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium Rs. ${getStatusColor(order.orderStatus)}`}>
            {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {item.name || 'Product'}
                    </Link>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                      <span className="font-semibold">Rs. {item.price?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="text-gray-700">
              <p>{order.shippingAddress}</p>
              <p className="mt-2">Phone: {order.phone}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{order.paymentMethod || 'COD'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-indigo-600">Rs. {order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="border-t pt-4 mb-4">
              <h3 className="font-semibold mb-3">Order Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {order.orderStatus !== 'pending' && order.orderStatus !== 'cancelled' && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-3"></div>
                    <div>
                      <p className="font-medium">Confirmed</p>
                    </div>
                  </div>
                )}
                {(order.orderStatus === 'shipped' || order.orderStatus === 'delivered') && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-3"></div>
                    <div>
                      <p className="font-medium">Shipped</p>
                    </div>
                  </div>
                )}
                {order.orderStatus === 'delivered' && order.deliveredAt && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-3"></div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-gray-500">{new Date(order.deliveredAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {order.orderStatus === 'cancelled' && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-3"></div>
                    <div>
                      <p className="font-medium">Cancelled</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {order.orderStatus === 'pending' && (
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleCancelOrder}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </Button>
              </div>
            )}

            {order.orderStatus === 'delivered' && order.orderItems?.[0]?.productId && (
              <div className="border-t pt-4">
                <Link to={`/products/${order.orderItems[0].productId}`}>
                  <Button fullWidth>Leave a Review</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

