import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import AuthContext from '../context/AuthContext';
import { FaBox, FaTruck, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await orderService.getOrderById(id);
                setOrder(data);
            } catch (err) {
                setError(err.response && err.response.data.message ? err.response.data.message : err.message);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrder();
        }
    }, [id, user]);

    if (loading) return <div className="text-center py-10">Loading order details...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!order) return <div className="text-center py-10">Order not found</div>;

    return (
        <div className="container mx-auto py-8">
            <Link to="/myorders" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium">
                <FaArrowLeft /> Back to My Orders
            </Link>

            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Order <span className="text-gray-500 text-lg font-mono">#{order._id}</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Shipping */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
                            <FaTruck className="text-indigo-600" /> Shipping
                        </h2>
                        <p><strong>Name:</strong> {order.user.name}</p>
                        <p><strong>Email:</strong> <a href={`mailto:${order.user.email}`} className="text-indigo-600">{order.user.email}</a></p>
                        <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                        <div className={`mt-4 p-3 rounded-md text-sm font-medium border ${order.isDelivered ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                            {order.isDelivered ? `Delivered on ${order.deliveredAt.substring(0, 10)}` : 'Not Delivered'}
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
                            <FaMoneyBillWave className="text-indigo-600" /> Payment
                        </h2>
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        <div className={`mt-4 p-3 rounded-md text-sm font-medium border ${order.isPaid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {order.isPaid ? `Paid on ${order.paidAt.substring(0, 10)}` : 'Not Paid'}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
                            <FaBox className="text-indigo-600" /> Order Items
                        </h2>
                        {order.orderItems.length === 0 ? (
                            <p>Order is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border" />
                                            <Link to={`/product/${item.product}`} className="hover:text-indigo-600 break-all font-medium text-gray-800">
                                                {item.name}
                                            </Link>
                                        </div>
                                        <div className="text-gray-600">
                                            {item.qty} x ₹{item.price} = <strong>₹{item.qty * item.price}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border sticky top-24">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Items</span>
                                <span>₹{order.itemsPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>₹{order.shippingPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>₹{order.taxPrice}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                <span>Total</span>
                                <span>₹{order.totalPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
