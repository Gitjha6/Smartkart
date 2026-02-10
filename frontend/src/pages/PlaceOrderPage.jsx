import { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import CheckoutSteps from '../components/CheckoutSteps';
import { orderService } from '../services/api';

const PlaceOrderPage = () => {
    const { cartItems, shippingAddress, paymentMethod, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    // Calculate prices
    const addDecimals = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2);
    };

    const itemsPrice = addDecimals(
        cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    );
    const shippingPrice = addDecimals(itemsPrice > 500 ? 0 : 50); // Free shipping over 500
    const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2))); // 15% tax
    const totalPrice = (
        Number(itemsPrice) +
        Number(shippingPrice) +
        Number(taxPrice)
    ).toFixed(2);

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        } else if (!paymentMethod) {
            navigate('/payment');
        }
    }, [shippingAddress, paymentMethod, navigate]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const placeOrderHandler = async () => {
        try {
            if (paymentMethod === 'Razorpay') {
                const res = await loadRazorpayScript();

                if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    return;
                }

                // 1. Create Order in Backend (Razorpay Order ID)
                const { data: razorpayOrder } = await orderService.createRazorpayOrder(totalPrice);

                // 2. Get Key ID
                const { data: keyId } = await orderService.getRazorpayKey();

                const options = {
                    key: keyId,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: 'SmartKart',
                    description: 'Transaction for SmartKart Order',
                    image: 'https://cdn-icons-png.flaticon.com/512/3081/3081448.png', // Dummy logo
                    order_id: razorpayOrder.id,
                    handler: async function (response) {
                        // 3. Payment Success - Create actual Order in DB
                        // Note: Ideally we should create the order in DB as 'Pending' FIRST, then update it.
                        // For simplicity MVP: process 'Place Order' now.

                        const orderData = {
                            orderItems: cartItems,
                            shippingAddress,
                            paymentMethod: "Razorpay",
                            itemsPrice: Number(itemsPrice),
                            shippingPrice: Number(shippingPrice),
                            taxPrice: Number(taxPrice),
                            totalPrice: Number(totalPrice),
                            paymentResult: {
                                id: response.razorpay_payment_id,
                                status: 'COMPLETED', // Simplified
                                update_time: String(Date.now()),
                                email_address: user.email,
                            }
                        };

                        await orderService.create(orderData);
                        clearCart();
                        alert('Payment Successful! Order Placed.');
                        navigate('/');
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: '9999999999', // Dummy
                    },
                    notes: {
                        address: shippingAddress.address,
                    },
                    theme: {
                        color: '#6366f1',
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();

            } else {
                // Normal COD or other flow
                const orderData = {
                    orderItems: cartItems,
                    shippingAddress,
                    paymentMethod,
                    itemsPrice: Number(itemsPrice),
                    shippingPrice: Number(shippingPrice),
                    taxPrice: Number(taxPrice),
                    totalPrice: Number(totalPrice),
                };

                await orderService.create(orderData);
                clearCart();
                alert('Order Placed Successfully!');
                navigate(`/`);
            }

        } catch (error) {
            setError(error.response && error.response.data.message ? error.response.data.message : error.message);
            console.error("Place order failed", error);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <CheckoutSteps step1 step2 step3 step4 />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Shipping</h2>
                        <p><strong>Address: </strong>
                            {shippingAddress.address}, {shippingAddress.city},{' '}
                            {shippingAddress.postalCode}, {shippingAddress.country}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Payment Method</h2>
                        <p><strong>Method: </strong>{paymentMethod}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Items</h2>
                        {cartItems.length === 0 ? (
                            <p>Your cart is empty</p>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                            <Link to={`/product/${item.product}`} className="hover:text-indigo-600 break-all">
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

                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border sticky top-24">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Items</span>
                                <span>₹{itemsPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>₹{shippingPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>₹{taxPrice}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                <span>Total</span>
                                <span>₹{totalPrice}</span>
                            </div>
                        </div>

                        {error && <div className="mt-4 bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}

                        <button
                            type="button"
                            className="w-full bg-indigo-600 text-white font-bold py-3 mt-4 rounded hover:bg-indigo-700 transition"
                            onClick={placeOrderHandler}
                            disabled={cartItems.length === 0}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
