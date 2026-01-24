import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../../services/api';

const ProductFilter = ({ onFilterChange, filters }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      // Handle direct array response from categories API
      setCategories(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    onFilterChange({ ...filters, category: categoryId });
  };

  const handlePriceChange = (priceRange) => {
    onFilterChange({ ...filters, ...priceRange });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => handleCategoryChange('')}
              className="mr-2"
            />
            All Categories
          </label>
          {categories.map((category) => (
            <label key={category._id} className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={filters.category === category._id}
                onChange={() => handleCategoryChange(category._id)}
                className="mr-2"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Price Range</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              checked={!filters.minPrice && !filters.maxPrice}
              onChange={() => handlePriceChange({ minPrice: '', maxPrice: '' })}
              className="mr-2"
            />
            Any Price
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              onChange={() => handlePriceChange({ minPrice: 0, maxPrice: 25 })}
              className="mr-2"
            />
            Under $25
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              onChange={() => handlePriceChange({ minPrice: 25, maxPrice: 50 })}
              className="mr-2"
            />
            $25 - $50
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              onChange={() => handlePriceChange({ minPrice: 50, maxPrice: 100 })}
              className="mr-2"
            />
            $50 - $100
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="price"
              onChange={() => handlePriceChange({ minPrice: 100, maxPrice: '' })}
              className="mr-2"
            />
            Over $100
          </label>
        </div>
      </div>
      
      <button
        onClick={() => onFilterChange({ category: '', minPrice: '', maxPrice: '', search: '' })}
        className="w-full text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default ProductFilter;