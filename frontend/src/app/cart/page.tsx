"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useCartStore } from "@/store/cartStore";
import { formatTaka } from "@/lib/utils";
import api from "@/lib/api";

const FREE_SHIPPING_THRESHOLD = 1500; // Free delivery over 1500 BDT in Sherpur

export default function StandaloneCartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPct: number;
    maxDiscount: number;
    description: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Discount calculation
  const discountAmount = appliedCoupon
    ? Math.min((subtotal * appliedCoupon.discountPct) / 100, appliedCoupon.maxDiscount || Infinity)
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Free shipping progress
  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await api.get(`/account/coupons/check?code=${encodeURIComponent(couponCode.trim())}`);
      if (res.data.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountPct: Number(res.data.discount_percentage),
          maxDiscount: Number(res.data.max_discount_amount || 0),
          description: res.data.description || res.data.message,
        });
        toast.success(`কুপন "${couponCode.toUpperCase()}" সফলভাবে প্রয়োগ করা হয়েছে!`);
        setCouponCode("");
      } else {
        toast.error(res.data.message || "অবৈধ বা মেয়াদোত্তীর্ণ কুপন কোড।");
      }
    } catch {
      toast.error("কুপন যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে লগইন করুন।");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("কুপন বাতিল করা হয়েছে");
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "Cart" }]} />

        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
              <span className="text-gray-900 font-bold">{totalItems}</span> items in your Cart
            </p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-16 border border-gray-100 shadow-sm text-center max-w-lg mx-auto space-y-5">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#f47920]">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900">
                Your Cart is Empty
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your shopping cart is currently empty. Explore our top offers and fresh products.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/products" />}
              className="h-12 px-8 rounded-full bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-sm shadow-md"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Start Shopping</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Delivery Progress Bar Ribbon */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5" lang="bn">
                    <Truck className="w-4 h-4 text-[#f47920]" />
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-green-700 font-bold">
                        🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!
                      </span>
                    ) : (
                      <span>
                        আর মাত্র <strong className="text-[#f47920]">{formatTaka(remainingForFreeShipping)}</strong> এর কেনাকাটা করলেই ফ্রি ডেলিভারি!
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-gray-500">{progressPct}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      progressPct >= 100 ? "bg-green-600" : "bg-[#f47920]"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.productId} className="p-4 sm:p-5 flex gap-4 items-center">
                    
                    {/* Item Image */}
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#F8F9FA] p-1.5">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <Link
                        href={
                          item.categorySlug
                            ? `/products/${item.categorySlug}/${item.slug}`
                            : `/products/${item.slug}`
                        }
                        className="line-clamp-2 text-xs sm:text-sm font-bold text-gray-900 hover:text-[#f47920] transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs sm:text-sm font-bold text-[#f47920]">
                        {formatTaka(item.price)}
                      </p>

                      {/* Stepper & Delete */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, item.quantity - 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-l-xl hover:bg-gray-200 text-gray-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                            className="h-8 w-8 flex items-center justify-center rounded-r-xl hover:bg-gray-200 text-gray-700 disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="পণ্যটি মুছুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total Price */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-400 font-medium hidden sm:block" lang="bn">মোট:</p>
                      <p className="text-sm sm:text-base font-extrabold text-gray-900">
                        {formatTaka(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#f47920] hover:text-[#d46212] transition-colors"
                  lang="bn"
                >
                  <span>← আরও কেনাকাটা করতে চান? অন্যান্য পণ্য দেখুন</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary & Coupon (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Summary Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100" lang="bn">
                  অর্ডার সামারি (Order Summary)
                </h3>

                {/* Coupon Code Input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5" lang="bn">
                    <Tag className="w-3.5 h-3.5 text-[#f47920]" />
                    কুপন বা ডিসকাউন্ট কোড
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2.5 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-800">{appliedCoupon.code}</span>
                        <span className="text-green-600">(-{appliedCoupon.discountPct}%)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        বাতিল
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="কুপন কোড লিখুন"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-xs uppercase outline-none focus:border-[#f47920] bg-gray-50/50"
                      />
                      <Button
                        type="submit"
                        disabled={isValidatingCoupon}
                        className="h-10 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold"
                        lang="bn"
                      >
                        প্রয়োগ
                      </Button>
                    </form>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-2 text-xs sm:text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span lang="bn">পণ্যের মূল্য (Subtotal):</span>
                    <span className="font-semibold text-gray-900">{formatTaka(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span lang="bn">কুপন ডিসকাউন্ট:</span>
                      <span>-{formatTaka(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span lang="bn">ডেলিভারি চার্জ:</span>
                    <span className="font-medium text-xs text-muted-foreground" lang="bn">
                      চেকআউটে এলাকা নির্বাচন করুন
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-sm sm:text-base font-bold text-gray-900" lang="bn">
                      সর্বমোট (Total):
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#f47920]">
                      {formatTaka(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Proceed to Checkout Button */}
                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full h-12 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
                  lang="bn"
                >
                  <span>চেকআউট সম্পন্ন করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span lang="bn">১০০% আসল পণ্যের নিশ্চয়তা</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#f47920] shrink-0" />
                  <span lang="bn">ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য পরিশোধ)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span lang="bn">২৪ ঘণ্টা সহজ রিটার্ন পলিসি</span>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </main>
  );
}
