import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_AUTH_API_URL || API_BASE_URL).replace(/\/$/, ''),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicRoutes = ['/', '/home', '/signin', '/signup', '/reset-password'];

const setupAxiosInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const currentPath = window.location.pathname;

      if (originalRequest.url?.includes('/api/auth/refresh-token')) {
        return Promise.reject(error);
      }

      const isPublicRoute = publicRoutes.some((route) => 
        currentPath === route || currentPath.startsWith(route + '/')
      );

      if (isPublicRoute) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        
        if (currentPath === '/signin') {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          await authAxiosInstance.post('/api/auth/refresh-token', {}, { withCredentials: true });
          return instance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('user');
          window.location.href = '/signin';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

setupAxiosInterceptor(axiosInstance);
setupAxiosInterceptor(authAxiosInstance);

export default axiosInstance;
