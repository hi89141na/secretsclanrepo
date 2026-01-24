import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

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
      
      // Handle different response formats
      // Products: { success, data } -> use productsRes.data
      // Categories: direct array -> use categoriesRes directly if it's an array
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
    <div>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to SecretsClan</h1>
          <p className="text-xl mb-8">Discover amazing products at great prices</p>
          <Link to="/products">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
            >
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded mb-4"
                />
              )}
              <h3 className="font-semibold">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        <ProductGrid products={featured} />
        <div className="text-center mt-8">
          <Link to="/products">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;