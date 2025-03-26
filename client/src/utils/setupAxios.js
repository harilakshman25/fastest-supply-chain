import axios from 'axios';
import { clearAuth } from '../redux/slices/authSlice';

export const setupAxiosInterceptors = (store) => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch(clearAuth());
      }
      return Promise.reject(error);
    }
  );
}; 