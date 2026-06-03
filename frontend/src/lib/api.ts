import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearToken, getToken } from '@/lib/auth';

/**
 * Shared Axios instance for the Future Shop API.
 *  - baseURL from NEXT_PUBLIC_API_URL
 *  - withCredentials for cookie-aware requests
 *  - attaches the in-memory Bearer token on every request
 *  - on 401: clears the token + routing cookies and opens the auth modal (/?auth=login)
 *  - 10s timeout
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  // Auth is Bearer-token (Authorization header), not cookies — so requests must
  // NOT be credentialed. With credentials the backend would need
  // Access-Control-Allow-Credentials:true, which it (correctly) doesn't send,
  // causing every client-side call to fail CORS.
  withCredentials: false,
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

/**
 * Decide whether a 401 should force a logout.
 *
 * We only logout on TRUE Sanctum auth failures, not application-level 401s
 * (e.g. order/business errors). Two layered checks:
 *   1. Skip for /orders and /payments paths — these can return 401 for
 *      reasons that should surface as error messages, not kick the user out.
 *   2. Only logout when the response carries `WWW-Authenticate: Bearer`
 *      (the header Sanctum sets on genuine token rejection). The backend
 *      exposes this header via CORS (config/cors.php).
 */
function shouldLogoutOn401(error: AxiosError): boolean {
  const url = error.config?.url ?? '';
  if (url.includes('/orders') || url.includes('/payments')) {
    return false;
  }

  const wwwAuth =
    error.response?.headers?.['www-authenticate'] ??
    (error.response?.headers as Record<string, string> | undefined)?.['WWW-Authenticate'];

  // If the header is present, it's a real auth failure → logout.
  // If absent, treat as application 401 and let the caller handle it.
  return typeof wwwAuth === 'string' && wwwAuth.toLowerCase().includes('bearer');
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined' && shouldLogoutOn401(error)) {
      clearToken();
      // Drop the middleware routing cookies as well.
      document.cookie = 'lb_auth=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'lb_role=; Path=/; Max-Age=0; SameSite=Lax';

      if (!window.location.search.includes('auth=login')) {
        window.location.href = '/?auth=login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
