import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, User, Product, Cart, Order, Wishlist, AuthResponse } from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
const apiService = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data, config);
    return response.data;
  },
};

// Auth API
export const authAPI = {
  // Register user
  register: async (userData: any): Promise<ApiResponse<AuthResponse>> => {
    return apiService.post<AuthResponse>('/auth/register', userData);
  },

  // Login user
  login: async (credentials: any): Promise<ApiResponse<AuthResponse>> => {
    return apiService.post<AuthResponse>('/auth/login', credentials);
  },

  // Get current user
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiService.get<{ user: User }>('/auth/me');
  },

  // Update profile
  updateProfile: async (profileData: any): Promise<ApiResponse<{ user: User }>> => {
    return apiService.put<{ user: User }>('/auth/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData: any): Promise<ApiResponse<void>> => {
    return apiService.put<void>('/auth/change-password', passwordData);
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (resetData: any): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/auth/reset-password', resetData);
  },

  // Verify email
  verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/auth/resend-verification', { email });
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    return apiService.post<void>('/auth/logout');
  },
};

// Products API
export const productsAPI = {
  // Get all products
  getProducts: async (params?: any): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
    return apiService.get<{ products: Product[]; pagination: any }>('/products', { params });
  },

  // Get single product
  getProduct: async (id: string): Promise<ApiResponse<{ product: Product }>> => {
    return apiService.get<{ product: Product }>(`/products/${id}`);
  },

  // Search products
  searchProducts: async (query: string, limit?: number): Promise<ApiResponse<{ products: Product[] }>> => {
    return apiService.get<{ products: Product[] }>('/products/search', { params: { q: query, limit } });
  },

  // Get products by category
  getProductsByCategory: async (category: string, params?: any): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
    return apiService.get<{ products: Product[]; pagination: any }>(`/products/category/${category}`, { params });
  },

  // Get categories
  getCategories: async (): Promise<ApiResponse<{ categories: string[] }>> => {
    return apiService.get<{ categories: string[] }>('/products/categories');
  },

  // Get brands
  getBrands: async (): Promise<ApiResponse<{ brands: string[] }>> => {
    return apiService.get<{ brands: string[] }>('/products/brands');
  },

  // Get featured products
  getFeaturedProducts: async (limit?: number): Promise<ApiResponse<{ products: Product[] }>> => {
    return apiService.get<{ products: Product[] }>('/products/featured', { params: { limit } });
  },

  // Get new arrivals
  getNewArrivals: async (limit?: number): Promise<ApiResponse<{ products: Product[] }>> => {
    return apiService.get<{ products: Product[] }>('/products/new-arrivals', { params: { limit } });
  },

  // Create product (Admin only)
  createProduct: async (productData: any): Promise<ApiResponse<{ product: Product }>> => {
    return apiService.post<{ product: Product }>('/products', productData);
  },

  // Update product (Admin only)
  updateProduct: async (id: string, productData: any): Promise<ApiResponse<{ product: Product }>> => {
    return apiService.put<{ product: Product }>(`/products/${id}`, productData);
  },

  // Delete product (Admin only)
  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return apiService.delete<void>(`/products/${id}`);
  },

  // Add review
  addReview: async (productId: string, reviewData: any): Promise<ApiResponse<{ product: Product }>> => {
    return apiService.post<{ product: Product }>(`/products/${productId}/reviews`, reviewData);
  },

  // Get product reviews
  getProductReviews: async (productId: string, params?: any): Promise<ApiResponse<{ reviews: any[]; pagination: any }>> => {
    return apiService.get<{ reviews: any[]; pagination: any }>(`/products/${productId}/reviews`, { params });
  },
};

// Cart API
export const cartAPI = {
  // Get cart
  getCart: async (): Promise<ApiResponse<{ cart: Cart }>> => {
    return apiService.get<{ cart: Cart }>('/cart');
  },

  // Get cart summary
  getCartSummary: async (): Promise<ApiResponse<{ itemCount: number; totalAmount: number; items: any[] }>> => {
    return apiService.get<{ itemCount: number; totalAmount: number; items: any[] }>('/cart/summary');
  },

  // Add to cart
  addToCart: async (cartData: any): Promise<ApiResponse<{ cart: Cart }>> => {
    return apiService.post<{ cart: Cart }>('/cart/add', cartData);
  },

  // Update cart item
  updateCartItem: async (cartData: any): Promise<ApiResponse<{ cart: Cart }>> => {
    return apiService.put<{ cart: Cart }>('/cart/update', cartData);
  },

  // Remove from cart
  removeFromCart: async (productId: string): Promise<ApiResponse<{ cart: Cart }>> => {
    return apiService.delete<{ cart: Cart }>(`/cart/remove/${productId}`);
  },

  // Clear cart
  clearCart: async (): Promise<ApiResponse<{ cart: Cart }>> => {
    return apiService.delete<{ cart: Cart }>('/cart/clear');
  },

  // Validate cart
  validateCart: async (): Promise<ApiResponse<any>> => {
    return apiService.post<any>('/cart/validate');
  },
};

// Orders API
export const ordersAPI = {
  // Get user orders
  getOrders: async (params?: any): Promise<ApiResponse<{ orders: Order[]; pagination: any }>> => {
    return apiService.get<{ orders: Order[]; pagination: any }>('/orders', { params });
  },

  // Get single order
  getOrder: async (id: string): Promise<ApiResponse<{ order: Order }>> => {
    return apiService.get<{ order: Order }>(`/orders/${id}`);
  },

  // Create order
  createOrder: async (orderData: any): Promise<ApiResponse<{ order: Order }>> => {
    return apiService.post<{ order: Order }>('/orders', orderData);
  },

  // Update order status (Admin only)
  updateOrderStatus: async (id: string, statusData: any): Promise<ApiResponse<{ order: Order }>> => {
    return apiService.put<{ order: Order }>(`/orders/${id}/status`, statusData);
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<ApiResponse<{ order: Order }>> => {
    return apiService.put<{ order: Order }>(`/orders/${id}/cancel`);
  },

  // Create payment intent
  createPaymentIntent: async (id: string): Promise<ApiResponse<any>> => {
    return apiService.post<any>(`/orders/${id}/payment-intent`);
  },

  // Confirm payment
  confirmPayment: async (id: string, paymentData: any): Promise<ApiResponse<{ order: Order }>> => {
    return apiService.post<{ order: Order }>(`/orders/${id}/confirm-payment`, paymentData);
  },

  // Get order statistics (Admin only)
  getOrderStats: async (): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/orders/stats');
  },
};

// Wishlist API
export const wishlistAPI = {
  // Get wishlist
  getWishlist: async (): Promise<ApiResponse<{ wishlist: Wishlist }>> => {
    return apiService.get<{ wishlist: Wishlist }>('/wishlist');
  },

  // Add to wishlist
  addToWishlist: async (wishlistData: any): Promise<ApiResponse<{ wishlist: Wishlist }>> => {
    return apiService.post<{ wishlist: Wishlist }>('/wishlist/add', wishlistData);
  },

  // Remove from wishlist
  removeFromWishlist: async (productId: string): Promise<ApiResponse<{ wishlist: Wishlist }>> => {
    return apiService.delete<{ wishlist: Wishlist }>(`/wishlist/remove/${productId}`);
  },
};

// Reviews API
export const reviewsAPI = {
  // Get product reviews
  getProductReviews: async (productId: string, params?: any): Promise<ApiResponse<{ reviews: any[]; pagination: any }>> => {
    return apiService.get<{ reviews: any[]; pagination: any }>(`/reviews/${productId}`, { params });
  },

  // Add review
  addReview: async (productId: string, reviewData: any): Promise<ApiResponse<any>> => {
    return apiService.post<any>(`/reviews/${productId}`, reviewData);
  },
};

// Admin API
export const adminAPI = {
  // Get all users
  getUsers: async (params?: any): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/admin/users', { params });
  },

  // Get all orders
  getOrders: async (params?: any): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/admin/orders', { params });
  },

  // Get dashboard stats
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiService.get<any>('/admin/stats');
  },
};

// File upload API
export const uploadAPI = {
  // Upload file
  uploadFile: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
