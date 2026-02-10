import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';

const ShippingPage = () => {
    const { shippingAddress, saveShippingAddress } = useContext(CartContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');

    const submitHandler = (e) => {
        e.preventDefault();
        saveShippingAddress({ address, city, postalCode, country });
        navigate('/payment');
    };

    return (
        <div className="container mx-auto max-w-lg py-8">
            <CheckoutSteps step1 step2 />
            <h1 className="text-3xl font-bold mb-6">Shipping Address</h1>
            <form onSubmit={submitHandler} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Address</label>
                    <input
                        type="text"
                        placeholder="Enter address"
                        value={address}
                        required
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-bold mb-2">City</label>
                    <input
                        type="text"
                        placeholder="Enter city"
                        value={city}
                        required
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Postal Code</label>
                    <input
                        type="text"
                        placeholder="Enter postal code"
                        value={postalCode}
                        required
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-bold mb-2">Country</label>
                    <input
                        type="text"
                        placeholder="Enter country"
                        value={country}
                        required
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition">
                    Continue to Payment
                </button>
            </form>
        </div>
    );
};

export default ShippingPage;
