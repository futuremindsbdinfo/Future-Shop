import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearToken, getToken } from '@/lib/auth';

/**
 * Shared Axios instance for the LocalBazaar API.
 *  - baseURL from NEXT_PUBLIC_API_URL
 *  - withCredentials for cookie-aware requests
 *  - attaches the in-memory Bearer token on every request
 *  - on 401: clears the token + routing cookies and redirects to /login
 *  - 10s timeout
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearToken();
      // Drop the middleware routing cookies as well.
      document.cookie = 'lb_auth=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'lb_role=; Path=/; Max-Age=0; SameSite=Lax';

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
