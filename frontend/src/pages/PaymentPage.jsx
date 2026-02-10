import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentPage = () => {
    const { shippingAddress, savePaymentMethod } = useContext(CartContext);
    const navigate = useNavigate();

    if (!shippingAddress.address) {
        navigate('/shipping');
    }

    const [paymentMethod, setPaymentMethod] = useState('PayPal');

    const submitHandler = (e) => {
        e.preventDefault();
        savePaymentMethod(paymentMethod);
        navigate('/placeorder');
    };

    return (
        <div className="container mx-auto max-w-lg py-8">
            <CheckoutSteps step1 step2 step3 />
            <h1 className="text-3xl font-bold mb-6">Payment Method</h1>
            <form onSubmit={submitHandler} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Select Method</label>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="PayPal"
                                name="paymentMethod"
                                value="PayPal"
                                checked={paymentMethod === 'PayPal'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-2"
                            />
                            <label htmlFor="PayPal">PayPal or Credit Card</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="Stripe"
                                name="paymentMethod"
                                value="Stripe"
                                checked={paymentMethod === 'Stripe'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-2"
                            />
                            <label htmlFor="Stripe">Stripe</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="radio"
                                id="COD"
                                name="paymentMethod"
                                value="Cash On Delivery"
                                checked={paymentMethod === 'Cash On Delivery'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mr-2"
                            />
                            <label htmlFor="COD">Cash On Delivery</label>
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition">
                    Continue to Place Order
                </button>
            </form>
        </div>
    );
};

export default PaymentPage;
