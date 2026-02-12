import React, { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import { useLocation } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilter from '../../components/product/ProductFilter';
import Loader from '../../components/common/Loader';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [location]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.search) params.search = filters.search;
      
      const response = await productAPI.getAll(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Products</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64">
          <ProductFilter filters={filters} onFilterChange={setFilters} />
        </aside>
        
        <main className="flex-1">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
            />
          </div>
          
          {loading ? (
            <Loader />
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{products.length} products found</p>
              <ProductGrid products={products} />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
