import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../common/EmptyState';

const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        message="Try adjusting your filters or check back later."
        actionText="View All Products"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;