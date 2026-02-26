import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';

const ProductFilter = ({ onFilterChange, filters }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        setCategories(Array.isArray(response) ? response : (response.data || []));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    onFilterChange({ ...filters, category: categoryId });
  };

  const handlePriceChange = (minPrice, maxPrice) => {
    onFilterChange({ ...filters, minPrice, maxPrice });
  };

  const isPriceRangeSelected = (min, max) => {
    const currentMin = filters.minPrice?.toString() || '';
    const currentMax = filters.maxPrice?.toString() || '';
    const checkMin = min?.toString() || '';
    const checkMax = max?.toString() || '';
    return currentMin === checkMin && currentMax === checkMax;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => handleCategoryChange('')}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
              <input
                type="radio"
                name="category"
                checked={filters.category === category._id}
                onChange={() => handleCategoryChange(category._id)}
                className="mr-2 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Price Range</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
            <input
              type="radio"
              name="price"
              checked={isPriceRangeSelected('', '')}
              onChange={() => handlePriceChange('', '')}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Any Price</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
            <input
              type="radio"
              name="price"
              checked={isPriceRangeSelected('0', '250')}
              onChange={() => handlePriceChange('0', '250')}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Under Rs. 250</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
            <input
              type="radio"
              name="price"
              checked={isPriceRangeSelected('250', '500')}
              onChange={() => handlePriceChange('250', '500')}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Rs. 250 - Rs. 500</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
            <input
              type="radio"
              name="price"
              checked={isPriceRangeSelected('500', '1000')}
              onChange={() => handlePriceChange('500', '1000')}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Rs. 500 - Rs. 1,000</span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors">
            <input
              type="radio"
              name="price"
              checked={isPriceRangeSelected('1000', '999999')}
              onChange={() => handlePriceChange('1000', '999999')}
              className="mr-2 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Over Rs. 1,000</span>
          </label>
        </div>
      </div>
      
      <button
        onClick={() => onFilterChange({ category: '', minPrice: '', maxPrice: '', search: '' })}
        className="w-full text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-2 px-4 rounded bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ProductFilter;
