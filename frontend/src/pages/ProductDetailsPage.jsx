import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';
import CartContext from '../context/CartContext';
import { FaStore, FaArrowLeft, FaShoppingCart, FaTags, FaBox } from 'react-icons/fa';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qty, setQty] = useState(1);

    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const { data } = await productService.getById(id);
                setProduct(data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, qty);
            alert(`${qty} x ${product.name} added to your cart!`);
            navigate('/cart');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><p className="text-xl text-gray-600">Loading product details...</p></div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">&larr; Back to Shop</Link>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 transition font-medium">
                <FaArrowLeft /> Back to Home
            </Link>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
                    {/* Product Image */}
                    <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm flex items-center justify-center p-4">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="max-w-full max-h-[400px] object-contain drop-shadow-md rounded-lg" />
                        ) : (
                            <div className="w-full h-80 flex flex-col items-center justify-center text-gray-400">
                                <FaBox className="text-6xl mb-4" />
                                <span>No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-2 flex justify-between items-start">
                            <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                                {product.category}
                            </span>
                            {product.countInStock > 0 ? (
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold">In Stock ({product.countInStock})</span>
                            ) : (
                                <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold">Out of Stock</span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

                        <div className="flex items-center gap-3 text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <FaStore className="text-xl text-indigo-500" />
                            <span className="font-medium text-lg">Sold by: {product.shop ? product.shop.name : 'Local Shop'}</span>
                        </div>

                        <div className="mb-6">
                            <p className="text-4xl font-bold text-gray-900">₹{product.price}</p>
                            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-lg text-gray-800 mb-2 border-b pb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {product.description || "No description provided for this product."}
                            </p>
                        </div>

                        {product.searchTags && product.searchTags.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaTags className="text-gray-400" />
                                    <h3 className="font-bold text-sm text-gray-700">Tags</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.searchTags.map((tag, index) => (
                                        <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                            {product.countInStock > 0 && (
                                <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                                    <button
                                        onClick={() => setQty(Math.max(1, qty - 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:bg-gray-50 font-bold"
                                        disabled={qty <= 1}
                                    >-</button>
                                    <span className="w-12 text-center font-bold text-gray-800">{qty}</span>
                                    <button
                                        onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:bg-gray-50 font-bold"
                                        disabled={qty >= product.countInStock}
                                    >+</button>
                                </div>
                            )}

                            <button
                                onClick={handleAddToCart}
                                disabled={product.countInStock === 0}
                                className={`flex-grow py-3 px-6 rounded-lg text-white font-bold text-lg shadow-md transition flex items-center justify-center gap-2 ${product.countInStock > 0
                                        ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                <FaShoppingCart /> {product.countInStock > 0 ? "Add to Cart" : "Out of Stock"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
