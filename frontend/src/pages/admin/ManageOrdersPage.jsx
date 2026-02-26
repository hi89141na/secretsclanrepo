import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      const ordersData = response.data || response;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
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
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Check if order status can be changed
  const canChangeStatus = (order) => {
    // Cannot change if cancelled
    if (order.isCancelled || order.orderStatus === 'cancelled') {
      return false;
    }
    
    // Cannot change if delivered for more than 1 hour
    if (order.orderStatus === 'delivered' && order.deliveredAt) {
      const oneHourInMs = 60 * 60 * 1000;
      const timeSinceDelivered = Date.now() - new Date(order.deliveredAt).getTime();
      if (timeSinceDelivered > oneHourInMs) {
        return false;
      }
    }
    
    return true;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === filter);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Orders</h1>
        <Link to="/admin">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-600 text-white dark:bg-yellow-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          Pending ({orders.filter(o => o.orderStatus === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'confirmed' ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          Confirmed ({orders.filter(o => o.orderStatus === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('shipped')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'shipped' ? 'bg-purple-600 text-white dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          Shipped ({orders.filter(o => o.orderStatus === 'shipped').length})
        </button>
        <button
          onClick={() => setFilter('delivered')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'delivered' ? 'bg-green-600 text-white dark:bg-green-500' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          Delivered ({orders.filter(o => o.orderStatus === 'delivered').length})
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => {
                  const isDisabled = !canChangeStatus(order);
                  
                  return (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <Link to={`/orders/${order._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                          #{order._id?.slice(-8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.user?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.orderItems?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Rs. {order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isDisabled ? (
                          <span className={`text-xs font-semibold rounded-full px-3 py-1 inline-block ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            {order.isCancelled && ' (Locked)'}
                            {order.orderStatus === 'delivered' && !order.isCancelled && ' (Locked)'}
                          </span>
                        ) : (
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-3 py-1 ${getStatusColor(order.orderStatus)} border-0 cursor-pointer`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link to={`/orders/${order._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageOrdersPage;

