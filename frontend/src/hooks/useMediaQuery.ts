import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook. On the server (and during hydration) it reports
 * `false`, so the initial client render matches the SSR output; after mount it
 * reflects the real viewport and updates on change. Built on useSyncExternalStore
 * so there is no setState-in-effect and no hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
