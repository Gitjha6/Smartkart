import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '@/store/slices/cartSlice';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, totalAmount, totalItems, isLoading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItem({ productId, quantity }));
    } else {
      dispatch(removeFromCart(productId));
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-responsive py-12">
          <div className="text-center">
            <div className="text-gray-400 mb-6">
              <FiShoppingBag className="w-24 h-24 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              to="/products"
              className="btn btn-primary btn-lg"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Link
              to="/products"
              className="btn btn-outline flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-error hover:text-error-dark"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.product._id} className="p-6">
                    <div className="flex space-x-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {item.product.description}
                            </p>
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-semibold text-gray-900">
                                ${item.product.price.toFixed(2)}
                              </span>
                              <span className={`stock-status ${item.product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                                {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-gray-400 hover:text-error transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-50 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-50 transition-colors"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              ${item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-success">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${(totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${(totalAmount * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="btn btn-primary w-full btn-lg"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="btn btn-outline w-full"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

