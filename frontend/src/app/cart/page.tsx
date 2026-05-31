"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCartStore } from "@/store/cartStore";

const TK = "৳";
const formatTk = (value: number) => `${TK}${value.toLocaleString("en-US")}`;

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const deliveryCharge = useCartStore((state) => state.deliveryCharge);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={<ShoppingCart className="h-7 w-7" />}
          title="আপনার কার্ট খালি"
          description="পণ্য যোগ করতে কেনাকাটা শুরু করুন।"
          action={
            <Button nativeButton={false} render={<Link href="/products" />} className="h-11 bg-[#1a6bdf] hover:bg-[#1559bd]">
              <span lang="bn">কেনাকাটা শুরু করুন</span>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" lang="bn">আপনার কার্ট</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-muted">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <Link href={`/product/${item.slug}`} className="line-clamp-2 font-medium hover:text-[#1a6bdf]">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-[#1a6bdf]">{formatTk(item.price)}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11"
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
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
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 text-red-600 hover:text-red-700"
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="shrink-0 text-right font-semibold">
                  {formatTk(item.price * item.quantity)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="font-semibold" lang="bn">অর্ডার সারসংক্ষেপ</h2>
              <Separator />
              <div className="flex justify-between text-sm">
                <span lang="bn">সাবটোটাল</span>
                <span>{formatTk(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span lang="bn">ডেলিভারি চার্জ</span>
                <span>{deliveryCharge > 0 ? formatTk(deliveryCharge) : "চেকআউটে নির্ধারিত"}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span lang="bn">মোট</span>
                <span>{formatTk(total)}</span>
              </div>
              <Button
                nativeButton={false}
                render={<Link href="/checkout" />}
                className="mt-2 h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]"
              >
                <span lang="bn">চেকআউট করুন</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
