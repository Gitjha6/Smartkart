import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Vite proxy handles redirection to backend
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const token = JSON.parse(userInfo).token;
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const productService = {
    getAll: (keyword = '', pageNumber = '') => api.get(`/products?keyword=${keyword}&pageNumber=${pageNumber}`),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data), // Shopkeeper
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const shopService = {
    create: (data) => api.post('/shops', data),
    getById: (id) => api.get(`/shops/${id}`),
    update: (id, data) => api.put(`/shops/${id}`, data),
};

export const orderService = {
    create: (data) => api.post('/orders', data),
    getOrderById: (id) => api.get(`/orders/${id}`),
    payOrder: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
    getMyOrders: () => api.get('/orders/myorders'),
};

export default api;
