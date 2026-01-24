import React from 'react';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

const CartSummary = () => {
  const { cart, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <Button
        fullWidth
        onClick={() => navigate('/checkout')}
        disabled={cart.length === 0}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};

export default CartSummary;