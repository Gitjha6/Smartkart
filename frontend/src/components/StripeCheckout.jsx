import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { orderService } from "../services/api";

const stripePromise = loadStripe("pk_test_51T3hC0DdGBaJh5jj0pcjp07ieYf9ehSHnwbwX9QzalZIuRRhGOdaz7Ya1t0UxVEtToTtO7fbpEuQsfvH3wwxTDRw00mkQjw7mS");

const CheckoutForm = ({ orderId, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL isn't strictly necessary if redirect is 'if_required' and the payment is successful synchronously, but it is required by the TS types
                return_url: `${window.location.origin}/order/${orderId}`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage("Payment succeeded!");
            // Update backend status
            try {
                await orderService.payOrder(orderId, {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    update_time: new Date().toISOString(),
                    email_address: "stripe_user@example.com", // Or fetch from order details
                });
                onSuccess(); // Triggers reload of order details
            } catch (backendError) {
                setMessage("Payment succeeded, but failed to update order status on our servers.");
            }
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="mt-4">
            <PaymentElement id="payment-element" />
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className={`w-full text-white py-3 rounded-lg mt-6 font-bold transition ${isLoading || !stripe || !elements ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner">Processing...</div> : "Pay now"}
                </span>
            </button>
            {message && <div id="payment-message" className="text-red-500 mt-4 text-center">{message}</div>}
        </form>
    );
};

export default function StripeWrapper({ orderId, onSuccess }) {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        orderService.createPaymentIntent(orderId)
            .then((res) => {
                setClientSecret(res.data.clientSecret);
            })
            .catch(err => {
                console.error("Failed to initialize Stripe Payment Intent", err);
            });
    }, [orderId]);

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="Stripe-Payment">
            {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm orderId={orderId} onSuccess={onSuccess} />
                </Elements>
            )}
        </div>
    );
}
