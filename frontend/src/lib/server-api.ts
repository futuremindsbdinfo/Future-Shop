/**
 * Server-side fetch helper for public API reads (used by Server Components).
 * Uses the native fetch so it participates in Next's caching/ISR.
 */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} for ${path}`);
  }

  return (await res.json()) as T;
}

/** Like apiFetch but returns a fallback instead of throwing (e.g. backend down at build time). */
export async function apiFetchSafe<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    return await apiFetch<T>(path, init);
  } catch {
    return fallback;
  }
}
