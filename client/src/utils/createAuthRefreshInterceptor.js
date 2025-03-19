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
          const res = await axios.post('/api/auth/refresh-token', {}, { timeout: 5000 });
          const { token } = res.data;
          setAuthToken(token);
          originalRequest.headers['x-auth-token'] = token;
          processQueue(null, token);
          return axios(originalRequest);
        } catch (refreshError) {
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