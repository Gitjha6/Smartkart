import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  openModal, 
  openSearch, 
  openSidebar, 
  toggleMobileMenu,
  setSearchQuery 
} from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { 
  FiSearch, 
  FiShoppingCart, 
  FiHeart, 
  FiUser, 
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings
} from 'react-icons/fi';
import { FaShoppingBag } from 'react-icons/fa';

const Header: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { totalItems: cartItems } = useAppSelector((state) => state.cart);
  const { totalItems: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { mobileMenu } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSearch = () => {
    dispatch(openSearch());
    dispatch(openModal('search'));
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      dispatch(openSidebar({ type: 'cart' }));
    } else {
      dispatch(openModal('login'));
    }
  };

  const handleWishlistClick = () => {
    if (isAuthenticated) {
      dispatch(openSidebar({ type: 'wishlist' }));
    } else {
      dispatch(openModal('login'));
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaShoppingBag className="text-2xl text-primary" />
            <span className="text-xl font-bold text-gray-900">SmartKart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : 'text-gray-600 hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`nav-link ${isActive('/products') ? 'active' : 'text-gray-600 hover:text-primary'}`}
            >
              Products
            </Link>
            <Link 
              to="/categories" 
              className={`nav-link ${isActive('/categories') ? 'active' : 'text-gray-600 hover:text-primary'}`}
            >
              Categories
            </Link>
            <Link 
              to="/deals" 
              className={`nav-link ${isActive('/deals') ? 'active' : 'text-gray-600 hover:text-primary'}`}
            >
              Deals
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="input w-full pl-10 pr-4"
                onClick={handleSearch}
                readOnly
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button (Mobile) */}
            <button
              onClick={handleSearch}
              className="md:hidden p-2 text-gray-600 hover:text-primary focus-ring"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={handleWishlistClick}
              className="relative p-2 text-gray-600 hover:text-primary focus-ring"
            >
              <FiHeart className="w-5 h-5" />
              {wishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative p-2 text-gray-600 hover:text-primary focus-ring"
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary focus-ring">
                  <FiUser className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiUser className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiSettings className="w-4 h-4 mr-3" />
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => dispatch(openModal('login'))}
                  className="btn btn-outline btn-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => dispatch(openModal('register'))}
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="md:hidden p-2 text-gray-600 hover:text-primary focus-ring"
            >
              {mobileMenu.isOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

