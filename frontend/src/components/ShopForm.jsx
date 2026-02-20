import { useState, useEffect } from 'react';

const ShopForm = ({ initialData, onSubmit, onCancel, submitLabel = "Save Details" }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                pincode: initialData.pincode || '',
                latitude: initialData.location?.coordinates ? initialData.location.coordinates[1] : (initialData.latitude || ''),
                longitude: initialData.location?.coordinates ? initialData.location.coordinates[0] : (initialData.longitude || ''),
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
                <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" rows="3"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" />
                </div>
            </div>


            {/* Hidden Lat/Lng for now or auto-filled */}

            <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition font-medium">
                    {submitLabel}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition font-medium">
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default ShopForm;
