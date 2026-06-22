import { redirect } from "next/navigation";

/**
 * The cart now lives in a global slide-out drawer (<CartDrawer/>) — opened from
 * the navbar cart icon or automatically on add-to-cart. This standalone page is
 * retired; any direct visit to /cart is sent home. (The drawer is opened via
 * cartStore.openCart, independent of this route.)
 */
export default function CartPage() {
  redirect("/");
}
