import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-white mt-auto transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">SecretsClan</h3>
            <p className="text-gray-400 dark:text-gray-500">
              Your trusted online store for quality products.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 dark:text-gray-500 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 dark:text-gray-500 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 dark:text-gray-500 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="text-gray-400 dark:text-gray-500 hover:text-white">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 dark:text-gray-500 hover:text-white">
                  My Account
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <p className="text-gray-400 dark:text-gray-500">
              Email: secretsclan2024@gmail.com<br />
              Phone: +92 319 6193361
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 dark:border-gray-800 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
          <p>&copy; 2026 SecretsClan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
