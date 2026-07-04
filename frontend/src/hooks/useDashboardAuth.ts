"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

/**
 * Customer dashboard auth gate. Mirrors the one-tick hydration pattern used
 * across all protected pages: wait for AuthHydrator to restore sessionStorage,
 * THEN check isAuthenticated. Avoids the hard-refresh redirect race.
 */
export function useDashboardAuth() {
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/?auth=login&next=/dashboard");
    }
  }, [hydrated, isAuthenticated, router]);

  return { hydrated, user, isAuthenticated };
}
