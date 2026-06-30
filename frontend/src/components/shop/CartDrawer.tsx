"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImageOff, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
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
          <SheetTitle lang="bn">
            আপনার ব্যাগ
            {totalItems > 0 && (
              <span className="text-muted-foreground"> · {totalItems} টি পণ্য</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium" lang="bn">আপনার ব্যাগ খালি</p>
            <Link
              href="/products"
              onClick={closeCart}
              lang="bn"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#f47920] px-5 text-sm font-medium text-white transition-colors hover:bg-[#e56910]"
            >
              কেনাকাটা শুরু করুন
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <ul className="flex-1 space-y-3 overflow-y-auto p-3">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                    {item.image ? (
                      // Plain img: cart thumbnails may point to external image URLs
                      // that are not in next/image remotePatterns.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
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
                      className="line-clamp-2 text-sm font-medium hover:text-[#f47920]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-semibold text-[#f47920]">
                      {formatTaka(item.price)}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11"
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          aria-label="Decrease"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11"
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          aria-label="Increase"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-sm font-semibold">
                    {formatTaka(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="space-y-3 border-t p-4">
              <div className="flex justify-between text-sm">
                <span lang="bn">সাবটোটাল</span>
                <span className="font-semibold">{formatTaka(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span lang="bn">ডেলিভারি চার্জ</span>
                <span lang="bn">চেকআউটে নির্ধারিত হবে</span>
              </div>
              <Button
                onClick={goToCheckout}
                className="h-12 w-full bg-[#f47920] text-base hover:bg-[#e56910]"
              >
                <span lang="bn">চেকআউট করুন</span>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
