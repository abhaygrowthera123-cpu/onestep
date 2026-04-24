import axios from 'axios';
import { auth } from '../firebase';
export const apiClient = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api' 
});
// Helper to wait for Firebase auth initialization
const getAuthToken = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        const token = await user.getIdToken();
        resolve(token);
      } else {
        resolve(null);
      }
    });
  });
};

apiClient.interceptors.request.use(async (config) => {
    // 1. Check for admin session token or dev mock token first
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        return config;
    }

    // 2. Wait for Firebase/Google token if not admin
    let token = null;
    if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
    } else {
        // Might still be initializing
        token = await getAuthToken();
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Clear stale admin tokens when server rejects them
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                // Admin token is stale (server restarted) — clear it
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminSession');
                console.warn('Stale admin session cleared');
            }
        }
        return Promise.reject(error);
    }
);
export const api = {
    // Products — paginated
    getProducts: async (params) => {
        const response = await apiClient.get('/products', { params });
        const data = response.data;
        if (data.data) {
            data.data = data.data.map(p => ({
                ...p,
                price: Number(p.price),
                discountPrice: p.discountPrice ? Number(p.discountPrice) : null
            }));
        }
        return data;
    },
    getProduct: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        const p = response.data;
        return {
            ...p,
            price: Number(p.price),
            discountPrice: p.discountPrice ? Number(p.discountPrice) : null
        };
    },
    createProduct: async (data) => {
        const response = await apiClient.post('/products', data);
        return response.data;
    },
    updateProduct: async (id, data) => {
        const response = await apiClient.put(`/products/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id) => {
        await apiClient.delete(`/products/${id}`);
    },
    // Categories
    getCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data;
    },
    getCategory: async (id) => {
        const response = await apiClient.get(`/categories/${id}`);
        return response.data;
    },
    createCategory: async (data) => {
        const response = await apiClient.post('/categories', data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await apiClient.put(`/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id) => {
        await apiClient.delete(`/categories/${id}`);
    },
    // Orders — paginated
    getOrders: async (params) => {
        const response = await apiClient.get('/orders', { params });
        return response.data;
    },
    getOrder: async (id) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },
    createOrder: async (data) => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },
    /** Unified checkout (COD, wallet, Razorpay) */
    checkout: async (data) => {
        const response = await apiClient.post('/checkout', data);
        return response.data;
    },
    verifyPayment: async (data) => {
        const response = await apiClient.post('/checkout/verify', data);
        return response.data;
    },
    cancelCheckout: async (orderId) => {
        const response = await apiClient.post('/checkout/cancel', { orderId });
        return response.data;
    },
    getMe: async () => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },
    getSellerOrders: async (params) => {
        const response = await apiClient.get('/orders/seller', { params });
        return response.data;
    },
    requestOrderReturn: async (orderId, reason) => {
        const response = await apiClient.patch(`/orders/${orderId}/request-return`, { reason });
        return response.data;
    },
    openInvoiceHtml: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}/invoice`, { responseType: 'text' });
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(response.data);
            w.document.close();
        }
    },
    updateOrderStatus: async (id, statusOrPayload) => {
        const body = typeof statusOrPayload === 'string' ? { status: statusOrPayload } : statusOrPayload;
        const response = await apiClient.patch(`/orders/${id}/status`, body);
        return response.data;
    },
    validateCoupon: async (code, subtotal) => {
        const response = await apiClient.post('/coupons/validate', { code, subtotal });
        return response.data;
    },
    getCoupons: async () => {
        const response = await apiClient.get('/coupons');
        return response.data;
    },
    createCoupon: async (data) => {
        const response = await apiClient.post('/coupons', data);
        return response.data;
    },
    updateCoupon: async (id, data) => {
        const response = await apiClient.patch(`/coupons/${id}`, data);
        return response.data;
    },
    deleteCoupon: async (id) => {
        await apiClient.delete(`/coupons/${id}`);
    },
    getSettingsPublic: async () => {
        const response = await apiClient.get('/settings/public');
        return response.data;
    },
    getSettings: async () => {
        const response = await apiClient.get('/settings');
        return response.data;
    },
    putStoreSettings: async (data) => {
        const response = await apiClient.put('/settings/store', data);
        return response.data;
    },
    // Addresses
    getAddresses: async () => {
        const response = await apiClient.get('/addresses');
        return response.data;
    },
    addAddress: async (data) => {
        const response = await apiClient.post('/addresses', data);
        return response.data;
    },
    updateAddress: async (id, data) => {
        const response = await apiClient.patch(`/addresses/${id}`, data);
        return response.data;
    },
    deleteAddress: async (id) => {
        await apiClient.delete(`/addresses/${id}`);
    },
    // Users
    getUsers: async () => {
        const response = await apiClient.get('/users');
        return response.data;
    },
    getUser: async (uid) => {
        const response = await apiClient.get(`/users/${uid}`);
        return response.data;
    },
    syncUser: async (data) => {
        const response = await apiClient.post('/users', data);
        return response.data;
    },
    updateUser: async (uid, data) => {
        const response = await apiClient.patch(`/users/${uid}`, data);
        return response.data;
    },
    updateUserRole: async (uid, role) => {
        const response = await apiClient.patch(`/users/${uid}/role`, { role });
        return response.data;
    },
    // Contact & Newsletter
    sendContactMessage: async (data) => {
        const response = await apiClient.post('/contact', data);
        return response.data;
    },
    subscribeNewsletter: async (email) => {
        const response = await apiClient.post('/contact/newsletter', { email });
        return response.data;
    },
    // Reviews
    getReviews: async (productId, params) => {
        const response = await apiClient.get(`/products/${productId}/reviews`, { params });
        return response.data;
    },
    addReview: async (productId, data) => {
        const response = await apiClient.post(`/products/${productId}/reviews`, data);
        return response.data;
    },
    // Uploads
    uploadImages: async (formData) => {
        const response = await apiClient.post('/upload', formData);
        return response.data;
    },
    // Admin: Razorpay refund
    initiateRefund: async (orderId, reason) => {
        const response = await apiClient.post(`/orders/${orderId}/refund`, { reason });
        return response.data;
    },
    // Wallet: create Razorpay order for adding money
    addMoneyToWallet: async (amount) => {
        const response = await apiClient.post('/wallet/add', { amount });
        return response.data;
    },
    // Wallet: verify Razorpay payment for wallet top-up
    verifyWalletTopup: async (data) => {
        const response = await apiClient.post('/wallet/verify', data);
        return response.data;
    },
};
