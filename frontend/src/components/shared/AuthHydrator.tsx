"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * Restores auth state from sessionStorage on first client mount. Runs after
 * hydration (in an effect) so the initial client render matches the SSR
 * output and there is no hydration mismatch.
 */
export function AuthHydrator() {
  const restore = useAuthStore((state) => state.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  return null;
}
