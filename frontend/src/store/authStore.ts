import { create } from 'zustand';
import { clearToken, setToken } from '@/lib/auth';
import type { User } from '@/types';

/**
 * Auth state. The secret token is held in memory (see lib/auth). On login we
 * additionally set two NON-sensitive cookies (lb_auth, lb_role) that the
 * middleware reads for route protection — the token itself is never persisted.
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

function setRoutingCookies(role: string): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `lb_auth=1; Path=/; SameSite=Lax${secure}`;
  document.cookie = `lb_role=${role}; Path=/; SameSite=Lax${secure}`;
}

function clearRoutingCookies(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'lb_auth=; Path=/; Max-Age=0; SameSite=Lax';
  document.cookie = 'lb_role=; Path=/; Max-Age=0; SameSite=Lax';
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    setToken(token);
    setRoutingCookies(user.role);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    clearRoutingCookies();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
