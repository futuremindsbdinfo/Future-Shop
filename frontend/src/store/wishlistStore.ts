import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WishlistItem } from '@/types';

/**
 * Client-side wishlist, mirroring the cart store. Persisted to localStorage
 * ("futureshop-wishlist") so a guest's wishlist survives a refresh or a new tab
 * — no login required. The stored snapshot (price/stock) is display-only; it is
 * never used for any server-side amount, so persisting it client-side is safe.
 */
interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: number) => void;
  has: (productId: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set({ items: get().items.filter((i) => i.productId !== item.productId) });
        } else {
          set({ items: [...get().items, { ...item }] });
        }
      },

      remove: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      has: (productId) => get().items.some((i) => i.productId === productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'futureshop-wishlist',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only the items are persisted (there is no derived state to recompute on
      // rehydrate, unlike the cart's totals — so no onRehydrateStorage needed).
      partialize: (state) => ({ items: state.items }),
      // Rehydrate manually (see <WishlistHydrator/>) so server and first client
      // render both start empty — avoids a hydration mismatch on the heart icon.
      skipHydration: true,
    },
  ),
);
