import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';
import AuthContext from '../context/AuthContext';
import { FaBox, FaTimes } from 'react-icons/fa';

const MyOrdersPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await orderService.getMyOrders();
                setOrders(data);
            } catch (err) {
                setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    if (loading) return <div className="text-center py-10">Loading orders...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaBox /> My Orders
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b">
                                <th className="p-4">Items</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Delivered</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            {order.orderItems.map((item, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-10 h-10 object-cover rounded border"
                                                    />
                                                    <span className="text-sm font-medium text-gray-800 truncate w-48 block">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{order.createdAt.substring(0, 10)}</td>
                                    <td className="p-4 font-medium">₹{order.totalPrice}</td>
                                    <td className="p-4 text-sm font-medium text-gray-700">
                                        {order.paymentMethod}
                                    </td>
                                    <td className="p-4">
                                        {order.isDelivered ? (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Delivered {order.deliveredAt.substring(0, 10)}
                                            </span>
                                        ) : (
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                Processing
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Link to={`/order/${order._id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
