import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/types';

/**
 * Client-side cart mirror. The server cart (Redis/cache) remains the source of
 * truth at checkout; this store drives the UI. totalPrice includes the current
 * delivery charge.
 *
 * Persisted to localStorage ("futureshop-cart") so the cart survives a refresh
 * or a new tab. SECURITY: the persisted cart is UNTRUSTED — prices/stock here
 * are display-only. The server recomputes every amount from the database at
 * checkout/order time (it only receives product_id + quantity), so tampering
 * with localStorage has no effect on what the customer is actually charged.
 */
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  deliveryCharge: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setDeliveryCharge: (charge: number) => void;
  // Drawer open/close state (NOT persisted — see partialize below).
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setCartOpen: (open: boolean) => void;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function computeTotals(
  items: CartItem[],
  deliveryCharge: number,
): { totalItems: number; totalPrice: number } {
  const totalItems = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPrice = items.length > 0 ? round2(subtotal + deliveryCharge) : 0;
  return { totalItems, totalPrice };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      deliveryCharge: 0,
      isOpen: false,

      addItem: (item) => {
        const items = [...get().items];
        const index = items.findIndex((existing) => existing.productId === item.productId);

        if (index >= 0) {
          items[index] = { ...items[index], quantity: items[index].quantity + item.quantity };
        } else {
          items.push({ ...item });
        }

        // Add only — the drawer does NOT auto-open, so the customer can keep
        // browsing and adding (a toast gives feedback; the navbar badge updates).
        set({ items, ...computeTotals(items, get().deliveryCharge) });
      },

      removeItem: (productId) => {
        const items = get().items.filter((item) => item.productId !== productId);
        set({ items, ...computeTotals(items, get().deliveryCharge) });
      },

      updateQty: (productId, quantity) => {
        const items = get()
          .items.map((item) => (item.productId === productId ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0);

        set({ items, ...computeTotals(items, get().deliveryCharge) });
      },

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),

      setDeliveryCharge: (deliveryCharge) =>
        set({ deliveryCharge, ...computeTotals(get().items, deliveryCharge) }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCartOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'futureshop-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only the line items are persisted; totals are derived and deliveryCharge
      // is session-specific (set from the chosen zone at checkout).
      partialize: (state) => ({ items: state.items }),
      // Rehydrate manually (see <CartHydrator/>) so server and first client
      // render both start empty — avoids a hydration mismatch on the cart badge.
      skipHydration: true,
      // Recompute derived totals once the persisted items are restored.
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = computeTotals(state.items, state.deliveryCharge);
          state.totalItems = totals.totalItems;
          state.totalPrice = totals.totalPrice;
        }
      },
    },
  ),
);
