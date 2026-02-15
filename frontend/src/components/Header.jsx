import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { FaShoppingCart, FaStore, FaChevronDown, FaRegUser, FaSignOutAlt, FaBox, FaList } from 'react-icons/fa';

import logo from '../assets/logo.png';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <img src={logo} alt="SmartKart" className="h-16 md:h-20 object-contain" />
                </Link>

                <nav className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                        Home
                    </Link>

                    <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition">
                        <FaShoppingCart className="text-2xl" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="relative group">
                            <button
                                className="flex items-center gap-2 text-gray-700 font-medium hover:text-indigo-600 transition focus:outline-none"
                            >
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <FaRegUser className="text-lg" />
                                </div>
                                <span>{user.name.split(' ')[0]}</span>
                                <FaChevronDown className="text-xs mt-1" />
                            </button>

                            {/* Dropdown Menu Wrapper with bridge (pt-2) */}
                            <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block z-50">
                                <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                                        <p className="text-sm font-bold text-gray-900">My Account</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>

                                    {user.role !== 'shopkeeper' && (
                                        <Link to="/myorders" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 text-sm transition transition-colors">
                                            <FaBox className="text-gray-400" /> My Orders
                                        </Link>
                                    )}

                                    {user.role === 'shopkeeper' && (
                                        <>
                                            <Link to="/shop/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 text-sm transition">
                                                <FaStore className="text-gray-400" /> My Shop
                                            </Link>
                                            <Link to="/shop/dashboard?tab=orders" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 text-sm transition">
                                                <FaList className="text-gray-400" /> Received Orders
                                            </Link>
                                        </>
                                    )}

                                    <div className="border-t border-gray-100 my-2"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-red-600 text-sm transition"
                                    >
                                        <FaSignOutAlt className="text-gray-400" /> Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-300 font-medium"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
