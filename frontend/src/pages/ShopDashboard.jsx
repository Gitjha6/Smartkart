import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { shopService, productService } from '../services/api';
import { FaStore, FaPlus, FaBoxOpen, FaEdit, FaTrash } from 'react-icons/fa';
import AddProduct from '../components/AddProduct';

const ShopDashboard = () => {
    const { user, login } = useContext(AuthContext); // Re-login to update context if needed? Better to fetch profile.
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createMode, setCreateMode] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form states for creating shop
    const [shopName, setShopName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!user) return;

        if (user.shopDetails) {
            fetchShopData(user.shopDetails);
        } else {
            setLoading(false);
            setCreateMode(true);
        }
    }, [user]);

    const fetchShopData = async (shopId) => {
        try {
            const { data } = await shopService.getById(shopId);
            setShop(data);
            if (data.products && data.products.length > 0) {
                // Fetch detailed products or use populated data if getById populates it.
                // My getShopById controller: .populate('products')
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Failed to fetch shop", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShop = async (e) => {
        e.preventDefault();
        try {
            // For location, we are dummying it for now.
            // Ideally use Geolocation API: navigator.geolocation.getCurrentPosition
            const dummyLat = 28.7041;
            const dummyLng = 77.1025;

            const shopData = {
                name: shopName,
                address,
                city,
                state,
                pincode,
                description,
                latitude: dummyLat,
                longitude: dummyLng
            };

            const { data } = await shopService.create(shopData);
            setShop(data);
            setCreateMode(false);
            // We need to update user context with new shopDetails ID.
            // A simple hack is to force a page reload or update context manually.
            // Since we can't easily update context from here without an exposed setter for 'user.shopDetails', 
            // alerting the user to re-login or handling it silently is option.
            // Better: update context.
            // For this MVP, let's just proceed with local state 'shop' set.
            alert("Shop created successfully!");
        } catch (error) {
            console.error("Failed to create shop", error);
            const errMsg = error.response?.data?.message || "Error creating shop";
            alert(errMsg);

            if (errMsg === 'User already has a shop') {
                // Force reload to sync profile
                window.location.reload();
            }
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await productService.delete(productId);
                setProducts(products.filter(p => p._id !== productId));
            } catch (error) {
                console.error("Failed to delete product", error);
                alert("Failed to delete product");
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowAddProduct(true);
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    if (createMode && !shop) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="text-center mb-6">
                    <FaStore className="text-5xl text-indigo-600 mx-auto mb-2" />
                    <h2 className="text-3xl font-bold text-gray-800">Setup Your Digital Shop</h2>
                    <p className="text-gray-600">Start selling to local customers in minutes.</p>
                </div>

                <form onSubmit={handleCreateShop} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Shop Name" className="border p-2 rounded w-full" value={shopName} onChange={e => setShopName(e.target.value)} required />
                        <input type="text" placeholder="Description (e.g. Grocery, Electronics)" className="border p-2 rounded w-full" value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>
                    <input type="text" placeholder="Address" className="border p-2 rounded w-full" value={address} onChange={e => setAddress(e.target.value)} required />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="City" className="border p-2 rounded w-full" value={city} onChange={e => setCity(e.target.value)} required />
                        <input type="text" placeholder="State" className="border p-2 rounded w-full" value={state} onChange={e => setState(e.target.value)} required />
                        <input type="text" placeholder="Pincode" className="border p-2 rounded w-full" value={pincode} onChange={e => setPincode(e.target.value)} required />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition">Create Shop</button>
                </form>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                        <p className="text-gray-600">{shop.address}, {shop.city}</p>
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">Verified Seller</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="text-xl font-bold text-yellow-500">{shop.rating} ★</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaBoxOpen /> Your Products</h2>
                <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
                >
                    <FaPlus /> Add Product
                </button>
            </div>

            {showAddProduct && (
                <AddProduct
                    productToEdit={editingProduct}
                    onProductAdded={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        fetchShopData(shop._id);
                    }}
                    onCancel={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                    }}
                />
            )}

            {products.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
                    <button
                        onClick={() => setShowAddProduct(true)}
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Add your first product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product._id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition relative group">
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                    title="Edit"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                            <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                                {product.image ? <img src={product.image} alt={product.name} className="object-cover h-full w-full" /> : <FaBoxOpen className="text-gray-400 text-4xl" />}
                            </div>
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-indigo-600">₹{product.price}</span>
                                <span className="text-sm text-gray-500">Stock: {product.countInStock}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopDashboard;
