import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage directly to avoid race condition
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      setCart(prevCart =>
        prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      toast.info('Updated quantity in cart');
    } else {
      setCart(prevCart => [...prevCart, { ...product, quantity }]);
      toast.success('Added to cart!');
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
    toast.info('Removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getEffectivePrice = (item) => {
    if (item.discountedPrice !== undefined && item.appliedOffer) {
      return item.discountedPrice;
    }
    if (item.salePrice && item.salePrice < item.price) {
      const now = new Date();
      const saleStart = item.saleStartDate ? new Date(item.saleStartDate) : null;
      const saleEnd = item.saleEndDate ? new Date(item.saleEndDate) : null;
      const isOnSale = (!saleStart || now >= saleStart) && (!saleEnd || now <= saleEnd);
      if (isOnSale) {
        return item.salePrice;
      }
    }
    return item.price;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + getEffectivePrice(item) * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount, getEffectivePrice }}>
      {children}
    </CartContext.Provider>
  );
};
