"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageOff, Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCartStore } from "@/store/cartStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatTaka } from "@/lib/utils";

/**
 * Global slide-out cart. Mobile: bottom sheet (thumb-friendly); desktop: right
 * side panel. Opened automatically on add-to-cart (cartStore.addItem) and via
 * the navbar cart icon. Mounted once in <Chrome/> for the storefront.
 */
export function CartDrawer() {
  const router = useRouter();
  const isOpen = useCartStore((s) => s.isOpen);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Mobile-first: bottom sheet by default, right panel from the sm breakpoint up.
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const side = isDesktop ? "right" : "bottom";

  const goToCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const goToCartPage = () => {
    closeCart();
    router.push("/cart");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side={side}
        className={
          side === "bottom"
            ? "flex max-h-[85vh] flex-col rounded-t-2xl p-0"
            : "flex w-full flex-col p-0 sm:max-w-md"
        }
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
            <ShoppingCart className="w-5 h-5 text-[#f47920]" />
            <span>Shopping Cart</span>
            {totalItems > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#f47920]">
                {totalItems} items
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#f47920]">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <p className="font-bold text-gray-800 text-base">Your Cart is Empty</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              No items added to your cart yet. Explore our fresh collection.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#f47920] px-6 text-xs font-bold text-white transition-colors hover:bg-[#e56910] shadow-md mt-2"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <ul className="flex-1 space-y-3 overflow-y-auto p-4 divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3 pt-3 first:pt-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#F8F9FA] p-1">
                    {item.image ? (
                      // Plain img: cart thumbnails may point to external image URLs
                      // that are not in next/image remotePatterns.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={item.categorySlug ? `/products/${item.categorySlug}/${item.slug}` : `/products/${item.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-xs sm:text-sm font-semibold text-gray-900 hover:text-[#f47920]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#f47920]">
                      {formatTaka(item.price)}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-xs sm:text-sm font-bold text-gray-900">
                    {formatTaka(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="space-y-3 border-t p-4 bg-gray-50/50">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">{formatTaka(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Delivery Charge</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={goToCartPage}
                  variant="outline"
                  className="flex-1 h-11 border-gray-300 text-gray-800 font-bold text-xs hover:bg-gray-100"
                >
                  View Cart
                </Button>
                <Button
                  onClick={goToCheckout}
                  className="flex-1 h-11 bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
