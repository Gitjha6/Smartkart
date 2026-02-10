import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
    return (
        <div className="flex justify-center mb-8">
            <div className="flex items-center">
                <div className={`${step1 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>Sign In</div>
                <div className="mx-2 text-gray-400">&gt;</div>
                <div className={`${step2 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                    {step2 ? <Link to="/shipping">Shipping</Link> : 'Shipping'}
                </div>
                <div className="mx-2 text-gray-400">&gt;</div>
                <div className={`${step3 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                    {step3 ? <Link to="/payment">Payment</Link> : 'Payment'}
                </div>
                <div className="mx-2 text-gray-400">&gt;</div>
                <div className={`${step4 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                    {step4 ? <Link to="/placeorder">Place Order</Link> : 'Place Order'}
                </div>
            </div>
        </div>
    );
};

export default CheckoutSteps;
