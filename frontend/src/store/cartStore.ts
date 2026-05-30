import { create } from 'zustand';
import type { CartItem } from '@/types';

/**
 * Client-side cart mirror. The server cart (Redis/cache) remains the source of
 * truth at checkout; this store drives the UI. totalPrice includes the current
 * delivery charge.
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

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  deliveryCharge: 0,

  addItem: (item) => {
    const items = [...get().items];
    const index = items.findIndex((existing) => existing.productId === item.productId);

    if (index >= 0) {
      items[index] = { ...items[index], quantity: items[index].quantity + item.quantity };
    } else {
      items.push({ ...item });
    }

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
}));
