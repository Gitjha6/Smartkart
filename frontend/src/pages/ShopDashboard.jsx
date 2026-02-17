import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { shopService, productService, orderService } from '../services/api';
import { FaStore, FaPlus, FaBoxOpen, FaEdit, FaTrash, FaList, FaCheck, FaTimes } from 'react-icons/fa';
import AddProduct from '../components/AddProduct';
import ShopForm from '../components/ShopForm';

const ShopDashboard = () => {
    const { user, login } = useContext(AuthContext);
    const location = useLocation();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createMode, setCreateMode] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Determine active tab from URL query param
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') === 'orders' ? 'orders' : 'products';
    const [activeTab, setActiveTab] = useState(initialTab);

    // No longer need individual states for form fields as ShopForm handles them internally
    // but we can keep them if we want, or just rely on ShopForm's internal state.
    // Simplifying: we'll just pass a handler to ShopForm.

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
                setProducts(data.products);
            }
            // Fetch orders too
            fetchShopOrders();
        } catch (error) {
            console.error("Failed to fetch shop", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchShopOrders = async () => {
        try {
            const { data } = await orderService.getShopOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch shop orders", error);
        }
    };

    const handleCreateShop = async (formData) => {
        try {
            const { data } = await shopService.create(formData);
            setShop(data);
            setCreateMode(false);
            // Update user context if possible, or just reload
            // window.location.reload();
            // Better:
            fetchShopData(data._id);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create shop');
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
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
                <div className="text-center mb-6">
                    <FaStore className="text-5xl text-indigo-600 mx-auto mb-2" />
                    <h2 className="text-3xl font-bold text-gray-800">Setup Your Digital Shop</h2>
                    <p className="text-gray-600">Start selling to local customers in minutes.</p>
                </div>

                <ShopForm
                    onSubmit={handleCreateShop}
                    submitLabel="Create Shop"
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 mt-4">
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

                {/* Tabs */}
                <div className="flex gap-4 mt-6 border-b">
                    <button
                        className={`pb-2 px-4 font-medium transition ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`pb-2 px-4 font-medium transition ${activeTab === 'orders' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                </div>
            </div>

            {activeTab === 'products' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaBoxOpen /> Your Products</h2>
                        <button
                            onClick={() => {
                                setEditingProduct(null);
                                setShowAddProduct(true);
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
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
                </>
            ) : (
                /* Orders Tab Content */
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FaList /> Received Orders</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No orders received yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b">
                                            <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                            <th className="p-4 font-semibold text-gray-600">Customer</th>
                                            <th className="p-4 font-semibold text-gray-600">Items</th>
                                            <th className="p-4 font-semibold text-gray-600">Total</th>
                                            <th className="p-4 font-semibold text-gray-600">Paid</th>
                                            <th className="p-4 font-semibold text-gray-600">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="p-4 font-mono text-sm">{order._id.substring(0, 10)}...</td>
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-800">{order.user?.name || 'Guest'}</div>
                                                    <div className="text-xs text-gray-500">{order.user?.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        {order.orderItems
                                                            .filter(item => item.shop === shop._id)
                                                            .map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                                    <span className="font-medium">{item.qty}x</span>
                                                                    <span className="truncate w-32">{item.name}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-800">₹{order.totalPrice}</td>
                                                <td className="p-4">
                                                    {order.isPaid ? (
                                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                            <FaCheck /> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
                                                            <FaTimes /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ShopDashboard;
