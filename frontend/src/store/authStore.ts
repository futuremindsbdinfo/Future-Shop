import { create } from "zustand";
import { clearToken, getToken, setToken } from "@/lib/auth";
import type { User } from "@/types";

/**
 * Auth state. The token lives in memory + sessionStorage (see lib/auth). The
 * user profile is mirrored to sessionStorage too so the role guard survives a
 * hard refresh. Two non-sensitive cookies (lb_auth, lb_role) are also set for
 * the middleware/proxy route protection.
 */
const USER_KEY = "lb_user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  restore: () => void;
}

function setRoutingCookies(role: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `lb_auth=1; Path=/; SameSite=Lax${secure}`;
  document.cookie = `lb_role=${role}; Path=/; SameSite=Lax${secure}`;
}

function clearRoutingCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "lb_auth=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "lb_role=; Path=/; Max-Age=0; SameSite=Lax";
}

function persistUser(user: User): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    setToken(token);
    persistUser(user);
    setRoutingCookies(user.role);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    clearRoutingCookies();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(USER_KEY);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    persistUser(user);
    set({ user });
  },

  // Restore from sessionStorage on app init (called by <AuthHydrator/>).
  restore: () => {
    const token = getToken();
    if (!token) return;

    let user: User | null = null;
    if (typeof window !== "undefined") {
      const raw = window.sessionStorage.getItem(USER_KEY);
      if (raw) {
        try {
          user = JSON.parse(raw) as User;
        } catch {
          user = null;
        }
      }
    }

    set({ token, user, isAuthenticated: true });
  },
}));
