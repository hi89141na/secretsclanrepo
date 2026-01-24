import React from 'react';
import { useCart } from '../../hooks/useCart';
import Button from '../common/Button';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const imageUrl = item.images?.[0] || '/placeholder.jpg';

  return (
    <div className="flex items-center border-b py-4">
      <img
        src={imageUrl}
        alt={item.name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1 ml-4">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center border rounded">
          <button
            onClick={() => updateQuantity(item._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-4">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item._id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
        </div>
        <div className="w-24 text-right font-semibold">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => removeFromCart(item._id)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default CartItem;