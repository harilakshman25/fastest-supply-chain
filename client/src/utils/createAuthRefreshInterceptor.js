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
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers['x-auth-token'] = token;
            return axios(originalRequest);
          }).catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
          const currentToken = localStorage.getItem('token');
          console.log('Attempting to refresh token with current token:', currentToken);
          const res = await axios.post('/api/auth/refresh-token', { token: currentToken }, { timeout: 5000 });
          const { token } = res.data;
          console.log('New token received:', token);
          setAuthToken(token);
          originalRequest.headers['x-auth-token'] = token;
          processQueue(null, token);
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.response?.data);
          processQueue(refreshError, null);
          store.dispatch(logout());
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
};

export default createAuthRefreshInterceptor;