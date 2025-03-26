import axios from 'axios';
import store from '../store';
import { logout } from '../redux/slices/authSlice';
import setAuthToken from './setAuthToken';

const createAuthRefreshInterceptor = () => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
    failedQueue = [];
  };

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error is not 401 or the request has already been retried, reject
      if (error.response?.status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['x-auth-token'] = token;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
          throw new Error('No token available');
        }

        const res = await axios.post('/api/auth/refresh-token', { token: currentToken });
        const { token } = res.data;
        
        // Update token in localStorage and axios headers
        setAuthToken(token);
        
        // Update the original request header
        originalRequest.headers['x-auth-token'] = token;
        
        // Process any queued requests
        processQueue(null, token);
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        
        // If refresh fails, logout the user
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        originalRequest._retry = false;
      }
    }
  );
};

export default createAuthRefreshInterceptor;