import { useState } from 'react';
import { productService } from '../services/api';

const AddProduct = ({ onProductAdded, onCancel, productToEdit = null }) => {
    const [name, setName] = useState(productToEdit ? productToEdit.name : '');
    const [price, setPrice] = useState(productToEdit ? productToEdit.price : '');
    const [category, setCategory] = useState(productToEdit ? productToEdit.category : '');
    const [countInStock, setCountInStock] = useState(productToEdit ? productToEdit.countInStock : '');
    const [description, setDescription] = useState(productToEdit ? productToEdit.description : '');
    const [image, setImage] = useState(productToEdit ? productToEdit.image : '');
    const [searchTags, setSearchTags] = useState(productToEdit && productToEdit.searchTags ? productToEdit.searchTags.join(',') : '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                name,
                price: Number(price),
                category,
                countInStock: Number(countInStock),
                description,
                image,
                searchTags
            };

            if (productToEdit) {
                await productService.update(productToEdit._id, productData);
            } else {
                await productService.create(productData);
            }
            onProductAdded();
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Error saving product");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" placeholder="Product Name" className="border p-2 w-full rounded" value={name} onChange={e => setName(e.target.value)} required />

                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Price (₹)" className="border p-2 w-full rounded" value={price} onChange={e => setPrice(e.target.value)} required />
                        <input type="number" placeholder="Stock Quantity" className="border p-2 w-full rounded" value={countInStock} onChange={e => setCountInStock(e.target.value)} required />
                    </div>

                    <input type="text" placeholder="Category (e.g. Snacks, Drinks)" className="border p-2 w-full rounded" value={category} onChange={e => setCategory(e.target.value)} required />
                    <input type="text" placeholder="Image URL (e.g. https://...)" className="border p-2 w-full rounded" value={image} onChange={e => setImage(e.target.value)} required />
                    <textarea placeholder="Description" className="border p-2 w-full rounded h-24" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                    <input type="text" placeholder="Search Tags (comma separated)" className="border p-2 w-full rounded" value={searchTags} onChange={e => setSearchTags(e.target.value)} />

                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            {productToEdit ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
