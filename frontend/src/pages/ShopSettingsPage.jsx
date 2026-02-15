import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { shopService } from '../services/api';
import ShopForm from '../components/ShopForm';
import { FaCog } from 'react-icons/fa';

const ShopSettingsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'shopkeeper') {
            navigate('/');
            return;
        }

        const fetchShop = async () => {
            try {
                if (user.shopDetails) {
                    const { data } = await shopService.getById(user.shopDetails);
                    setShop(data);
                }
            } catch (error) {
                console.error("Failed to fetch shop", error);
            } finally {
                setLoading(false);
            }
        };

        fetchShop();
    }, [user, navigate]);

    const handleUpdateShop = async (formData) => {
        try {
            await shopService.update(shop._id, formData);
            alert('Shop settings updated successfully!');
            // Refresh logic if needed
        } catch (error) {
            alert('Failed to update shop settings.');
            console.error(error);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    if (!shop) {
        return <div className="text-center py-10">Shop not found. Please create one first.</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                        <FaCog className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Shop Settings</h1>
                        <p className="text-gray-500 text-sm">Update your store information</p>
                    </div>
                </div>

                <ShopForm
                    initialData={shop}
                    onSubmit={handleUpdateShop}
                    onCancel={() => navigate('/shop/dashboard')}
                />
            </div>
        </div>
    );
};

export default ShopSettingsPage;
