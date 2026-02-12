import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Welcome, {user?.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Link to="/orders" className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800">
            <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">My Orders</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View your order history</p>
          </Link>
          <Link to="/profile" className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800">
            <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">My Profile</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account</p>
          </Link>
          <Link to="/cart" className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-100 dark:border-indigo-800">
            <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">Shopping Cart</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View your cart</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
