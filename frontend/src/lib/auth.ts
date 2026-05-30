/**
 * Token management — kept in memory ONLY.
 *
 * The access token is never written to localStorage, sessionStorage, or a
 * cookie, which keeps it out of reach of XSS-based storage exfiltration. It
 * lives for the lifetime of the JS execution context (lost on full reload),
 * and is re-established by re-authenticating or calling /auth/me.
 */

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  return inMemoryToken;
}

export function setToken(token: string | null): void {
  inMemoryToken = token;
}

export function clearToken(): void {
  inMemoryToken = null;
}

export function isAuthenticated(): boolean {
  return inMemoryToken !== null;
}
