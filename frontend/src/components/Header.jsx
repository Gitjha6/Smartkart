import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { FaShoppingCart, FaStore } from 'react-icons/fa';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                    <FaStore /> SmartKart
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
                        <div className="flex items-center gap-4">
                            {user.role === 'shopkeeper' && (
                                <Link to="/shop/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                                    My Shop
                                </Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium transition">
                                    Admin
                                </Link>
                            )}

                            <div className="flex items-center gap-3">
                                <span className="text-gray-700 font-medium hidden md:block">Hi, {user.name.split(' ')[0]}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 text-sm font-medium"
                                >
                                    Logout
                                </button>
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
