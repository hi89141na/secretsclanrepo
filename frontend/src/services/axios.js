import axios from 'axios';
import API_BASE_URL from '../utils/constants';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
  (response) => {
    // Extract data from backend response format { success: true, data: ... }
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!error.config?.silent) {
          toast.error('Session expired. Please login again.');
        }
      } else if (!error.config?.silent) {
        const errorMessage = error.response.data?.message || 'An error occurred';
        toast.error(errorMessage);
      }
    } else if (error.request && !error.config?.silent) {
      toast.error('Cannot connect to server. Please ensure the backend is running on port 5000.');
    } else if (!error.config?.silent) {
      toast.error('An error occurred');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;