import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeSidebar } from '@/store/slices/uiSlice';
import { FiX, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sidebar } = useAppSelector((state) => state.ui);
  const { items: cartItems, totalAmount } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const handleClose = () => {
    dispatch(closeSidebar());
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {sidebar.type === 'cart' ? 'Shopping Cart' : 'Wishlist'}
          </h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {sidebar.type === 'cart' ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <FiShoppingCart className="mr-2" />
                <span>Cart Items: {cartItems.length}</span>
              </div>
              <div className="text-lg font-semibold">
                Total: ${totalAmount.toFixed(2)}
              </div>
              <Link to="/cart" className="btn btn-primary w-full" onClick={handleClose}>
                View Cart
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <FiHeart className="mr-2" />
                <span>Wishlist Items: {wishlistItems.length}</span>
              </div>
              <Link to="/wishlist" className="btn btn-primary w-full" onClick={handleClose}>
                View Wishlist
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

