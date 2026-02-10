import { useState, useEffect, useContext } from 'react';
import { productService } from '../services/api';
import CartContext from '../context/CartContext';
import { FaSearch, FaMapMarkerAlt, FaStore, FaShoppingCart } from 'react-icons/fa';

const Home = () => {
    const [keyword, setKeyword] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (search = '') => {
        setLoading(true);
        try {
            const { data } = await productService.getAll(search);
            setProducts(data.products);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(keyword);
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        alert(`${product.name} added to cart!`);
    };

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-indigo-600 py-12 px-4 rounded-xl mb-8 text-center text-white shadow-lg">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Everything Nearby</h1>
                <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                    Search for products in your local shops. Check availability, compare prices, and shop smart.
                </p>

                <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2 justify-center">
                    <div className="relative flex-grow max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md"
                            placeholder="Search for 'Milk', 'Laptops', 'Shoes'..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-3 px-8 rounded-lg shadow-md transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Product Grid */}
            <div className="mb-4 flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt /> Showing results for <span className="font-bold text-gray-800">New Delhi</span> (Dummy Location)
            </div>

            {loading ? (
                <div className="text-center py-10">Loading products...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-10 bg-white rounded-lg">
                            <p className="text-gray-500 text-lg">No products found matching your search.</p>
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product._id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition duration-300 border border-gray-100 overflow-hidden group flex flex-col h-full">
                                <div className="h-48 bg-gray-100 relative overflow-hidden flex-shrink-0">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-indigo-600 shadow-sm">
                                        {product.category}
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">{product.name}</h3>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <FaStore />
                                        <span className="truncate">Local Shop</span>
                                    </div>

                                    <div className="mt-auto flex justify-between items-end">
                                        <div>
                                            <p className="text-gray-400 text-xs">Price</p>
                                            <p className="text-xl font-bold text-gray-900">₹{product.price}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-2 rounded text-sm font-medium transition flex items-center gap-1 shadow-sm"
                                        >
                                            <FaShoppingCart /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
