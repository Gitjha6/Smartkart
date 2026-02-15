import { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem('cartItems');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    const [shippingAddress, setShippingAddress] = useState(() => {
        const storedAddress = localStorage.getItem('shippingAddress');
        return storedAddress ? JSON.parse(storedAddress) : {};
    });

    const [paymentMethod, setPaymentMethod] = useState(() => {
        return localStorage.getItem('paymentMethod') || 'PayPal';
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    }, [shippingAddress]);

    useEffect(() => {
        localStorage.setItem('paymentMethod', paymentMethod);
    }, [paymentMethod]);

    const addToCart = (product, qty) => {
        const item = {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            shop: product.shop && product.shop._id ? product.shop._id : product.shop, // Ensure we get the ID string/ObjectId, not the full object
            countInStock: product.countInStock,
            qty: Number(qty),
        };

        const existItem = cartItems.find((x) => x.product === item.product);

        if (existItem) {
            setCartItems(
                cartItems.map((x) =>
                    x.product === existItem.product ? item : x
                )
            );
        } else {
            setCartItems([...cartItems, item]);
        }
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((x) => x.product !== id));
    };

    const saveShippingAddress = (data) => {
        setShippingAddress(data);
    };

    const savePaymentMethod = (data) => {
        setPaymentMethod(data);
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                shippingAddress,
                saveShippingAddress,
                paymentMethod,
                savePaymentMethod,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
