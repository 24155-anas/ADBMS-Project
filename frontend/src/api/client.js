import axios from 'axios';
import { toast } from 'react-toastify';
import { mapError } from '../utils/errorMap';

const api = axios.create({
    baseURL: '/api/v1',
    timeout: 12000,
});

// Inject JWT on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global error handler
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.error || err.response?.data?.message || err.message;

        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on signin to avoid wiping out error toasts
            if (!window.location.pathname.includes('/signin')) {
                window.location.href = '/signin';
            }
            return Promise.reject(err);
        }

        const friendly = mapError(msg);
        toast.error(friendly);
        return Promise.reject(err);
    }
);

export default api;
