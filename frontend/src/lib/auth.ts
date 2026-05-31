/**
 * Token management.
 *
 * Primary store is in-memory. As a compromise for surviving hard refreshes,
 * the token is mirrored to sessionStorage (NOT localStorage) — sessionStorage
 * is cleared when the tab/browser closes, which is a safer middle ground than
 * persistent localStorage.
 */

const STORAGE_KEY = "lb_token";

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken;

  if (typeof window !== "undefined") {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      inMemoryToken = stored;
      return stored;
    }
  }

  return null;
}

export function setToken(token: string | null): void {
  inMemoryToken = token;

  if (typeof window !== "undefined") {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function clearToken(): void {
  inMemoryToken = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
