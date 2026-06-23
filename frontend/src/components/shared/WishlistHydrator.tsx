"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * Restores the persisted wishlist from localStorage on first client mount. The
 * store is created with `skipHydration`, so this manual rehydrate is what
 * populates it. Running in an effect (after hydration) keeps the initial client
 * render identical to the SSR output, avoiding a hydration mismatch.
 */
export function WishlistHydrator() {
  useEffect(() => {
    useWishlistStore.persist.rehydrate();
  }, []);

  return null;
}
