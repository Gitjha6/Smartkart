import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { closeMobileMenu, openModal } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { 
  FiX, 
  FiHome, 
  FiShoppingBag, 
  FiGrid, 
  FiTag, 
  FiUser, 
  FiShoppingCart, 
  FiHeart,
  FiLogOut,
  FiSettings
} from 'react-icons/fi';

const MobileMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleClose = () => {
    dispatch(closeMobileMenu());
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiShoppingBag, label: 'Products', path: '/products' },
    { icon: FiGrid, label: 'Categories', path: '/categories' },
    { icon: FiTag, label: 'Deals', path: '/deals' },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus-ring"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleClose}
                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="mt-8 pt-6 border-t">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm text-gray-500">
                  Welcome, {user?.name?.split(' ')[0] || 'User'}
                </div>
                <Link
                  to="/profile"
                  onClick={handleClose}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={handleClose}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiSettings className="w-5 h-5" />
                  <span className="font-medium">Orders</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    dispatch(openModal('login'));
                    handleClose();
                  }}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </button>
                <button
                  onClick={() => {
                    dispatch(openModal('register'));
                    handleClose();
                  }}
                  className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors w-full"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">Sign Up</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/cart"
                onClick={handleClose}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiShoppingCart className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Cart</span>
              </Link>
              <Link
                to="/wishlist"
                onClick={handleClose}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiHeart className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Wishlist</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;

