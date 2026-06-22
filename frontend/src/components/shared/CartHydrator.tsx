"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

/**
 * Restores the persisted cart from localStorage on first client mount. The store
 * is created with `skipHydration`, so this manual rehydrate is what populates the
 * cart. Running it in an effect (after hydration) keeps the initial client render
 * identical to the SSR output, avoiding a hydration mismatch on the cart badge.
 */
export function CartHydrator() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return null;
}
