import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';

const CartPage = () => {
    const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const checkoutHandler = () => {
        if (user) {
            navigate('/shipping');
        } else {
            navigate('/login?redirect=shipping');
        }
    };

    return (
        <div className="container mx-auto py-8">
            <Link to="/" className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition">
                <FaArrowLeft className="mr-2" /> Continue Shopping
            </Link>

            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-xl text-gray-500 mb-4">Your cart is empty</p>
                    <Link to="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition">
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <Link to={`/product/${item.product}`} className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
                                            {item.name}
                                        </Link>
                                        <p className="text-indigo-600 font-bold">₹{item.price}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <select
                                        className="border rounded p-1 bg-gray-50 cursor-pointer"
                                        value={item.qty}
                                        onChange={(e) => addToCart({ ...item, _id: item.product, countInStock: item.countInStock }, Number(e.target.value))}
                                    >
                                        {[...Array(item.countInStock).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(item.product)}
                                        className="text-red-500 hover:text-red-700 transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                                <span>₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-6 text-xl font-bold text-gray-900 border-t pt-2">
                                <span>Total</span>
                                <span>₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                            </div>
                            <button
                                type="button"
                                className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition font-bold"
                                onClick={checkoutHandler}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
