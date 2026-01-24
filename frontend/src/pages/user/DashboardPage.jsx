import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Link to="/orders" className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100">
            <h3 className="font-semibold text-indigo-600">My Orders</h3>
            <p className="text-gray-600 mt-2">View your order history</p>
          </Link>
          <Link to="/profile" className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100">
            <h3 className="font-semibold text-indigo-600">My Profile</h3>
            <p className="text-gray-600 mt-2">Manage your account</p>
          </Link>
          <Link to="/cart" className="bg-indigo-50 p-6 rounded-lg hover:bg-indigo-100">
            <h3 className="font-semibold text-indigo-600">Shopping Cart</h3>
            <p className="text-gray-600 mt-2">View your cart</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
