import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({ limit: 8 }),
        categoryAPI.getAll()
      ]);
      
      setFeatured(productsRes.data || productsRes);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes.data || []));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="overflow-hidden">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-800 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">SecretsClan</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl mb-10 text-indigo-100 font-light max-w-2xl mx-auto">
            Discover amazing products at great prices
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-8 py-4 text-lg font-semibold bg-white text-indigo-600 rounded-full shadow-2xl hover:shadow-indigo-300 transition-all duration-300 overflow-hidden group">
                <span className="relative z-10">Shop Now</span>
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-pink-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16 md:py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Explore our curated collections
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category._id} category={category} index={index} />
          ))}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16 md:py-20 bg-white dark:bg-gray-800 transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Hand-picked favorites just for you
          </p>
        </motion.div>
        
        <ProductGrid products={featured} />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12">
          <Link to="/products">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl">
                View All Products
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
};

const CategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Link to={`/products?category=--version{category._id}`}>
        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer">
          {category.image && (
            <div className="relative overflow-hidden aspect-square">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
          <div className="p-4 text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {category.name}
            </h3>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default HomePage;
