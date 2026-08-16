"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Tag,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ArrowRight,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { formatTaka } from "@/lib/utils";
import api from "@/lib/api";
import type { DeliveryZone, Order, PaymentMethod, Address } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState(false);

  // Coupon & Wallet state
  const [couponCode, setCouponCode] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    message: string;
    discount_percentage?: number;
    max_discount_amount?: number | null;
  } | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState("0.00");

  // 1. Pre-fill user profile & saved address if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name && !name) setName(user.name);
      if (user.phone && !phone) setPhone(user.phone);

      // Fetch saved addresses
      api
        .get<{ data: Address[] }>("/addresses")
        .then((res) => {
          const defaultAddr = res.data.data.find((a) => a.is_default) || res.data.data[0];
          if (defaultAddr) {
            if (defaultAddr.recipient_name && !name) setName(defaultAddr.recipient_name);
            if (defaultAddr.phone && !phone) setPhone(defaultAddr.phone);
            if (defaultAddr.address && !address) setAddress(defaultAddr.address);
          }
        })
        .catch(() => {});

      // Fetch wallet balance
      api
        .get<{ balance: string }>("/account/wallet")
        .then((r) => setWalletBalance(r.data.balance))
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  // 2. Fetch delivery zones
  useEffect(() => {
    api
      .get<{ data: DeliveryZone[] }>("/delivery-zones")
      .then((res) => {
        setZones(res.data.data);
        if (res.data.data.length > 0) {
          // Default to Sherpur zone if found
          const sherpurZone = res.data.data.find((z) =>
            z.name.toLowerCase().includes("sherpur")
          );
          setZoneId(sherpurZone ? sherpurZone.id : res.data.data[0].id);
        }
      })
      .catch(() => toast.error("ডেলিভারি জোন লোড করা যায়নি।"));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedZone = zones.find((z) => z.id === zoneId) ?? null;
  const deliveryCharge = selectedZone ? Number(selectedZone.delivery_charge) : 0;

  // Coupon discount calculation
  let couponDiscount = 0;
  if (couponResult?.valid && couponResult.discount_percentage) {
    couponDiscount = Math.round(((subtotal * couponResult.discount_percentage) / 100) * 100) / 100;
    if (couponResult.max_discount_amount != null && couponDiscount > couponResult.max_discount_amount) {
      couponDiscount = Number(couponResult.max_discount_amount);
    }
  }

  const walletNumber = Number(walletBalance) || 0;
  const subtotalPlusDelivery = subtotal + deliveryCharge;
  const amountAfterDiscount = Math.max(0, subtotalPlusDelivery - couponDiscount);
  const walletApplied =
    useWallet && walletNumber > 0 ? Math.min(walletNumber, amountAfterDiscount) : 0;
  const finalTotal = Math.max(0, amountAfterDiscount - walletApplied);

  const hasGroceryItems = items.some((item) => item.isGrocery);
  const isZoneSherpur = selectedZone
    ? selectedZone.name.toLowerCase().includes("sherpur") || selectedZone.id === 1
    : false;
  const isShippingInvalid = hasGroceryItems && !isZoneSherpur;

  const checkCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponChecking(true);
    setCouponResult(null);
    try {
      const res = await api.get<{
        valid: boolean;
        message: string;
        discount_percentage?: number;
        max_discount_amount?: number | null;
      }>(`/account/coupons/check?code=${encodeURIComponent(code)}`);
      setCouponResult(res.data);
      if (res.data.valid) {
        toast.success(`কুপন "${code.toUpperCase()}" সফলভাবে প্রয়োগ করা হয়েছে!`);
      } else {
        toast.error(res.data.message || "অবৈধ বা মেয়াদোত্তীর্ণ কুপন।");
      }
    } catch {
      toast.error("কুপন যাচাই করতে সমস্যা হয়েছে। অনুগ্রহ করে লগইন করুন।");
    } finally {
      setCouponChecking(false);
    }
  };

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("আপনার কার্ট খালি!");
      return;
    }
    if (!name.trim()) {
      toast.error("অনুগ্রহ করে আপনার নাম লিখুন।");
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      toast.error("অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।");
      return;
    }
    if (!address.trim()) {
      toast.error("অনুগ্রহ করে আপনার সম্পূর্ণ ঠিকানা লিখুন।");
      return;
    }
    if (!zoneId) {
      toast.error("অনুগ্রহ করে ডেলিভারি এলাকা নির্বাচন করুন।");
      return;
    }
    if (hasGroceryItems && !isZoneSherpur) {
      toast.error("মুদি ও পচনশীল পণ্য শুধুমাত্র শেরপুর, বগুড়ায় ডেলিভারিযোগ্য।");
      return;
    }

    setLoading(true);
    try {
      // Sync client cart items into the server cart before placing order
      await api.delete("/cart").catch(() => {});
      for (const item of items) {
        await api.post("/cart/items", { product_id: item.productId, quantity: item.quantity });
      }

      const res = await api.post<{ data: Order }>("/orders", {
        shipping_name: name.trim(),
        shipping_phone: phone.trim(),
        shipping_address: address.trim(),
        delivery_zone_id: zoneId,
        payment_method: paymentMethod,
        coupon_code: couponResult?.valid ? couponCode.trim() : undefined,
        use_wallet: useWallet && walletNumber > 0 ? true : undefined,
      });

      clearCart();
      toast.success("অর্ডার সফলভাবে গ্রহণ করা হয়েছে!");
      router.push(`/orders/success?order=${encodeURIComponent(res.data.data.order_number)}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 md:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: "শপিং কার্ট", url: "/cart" }, { label: "চেকআউট" }]} />

        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight" lang="bn">
            চেকআউট ও অর্ডার সম্পন্ন করুন
          </h1>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5" lang="bn">
            ডেলিভারি ঠিকানা ও পেমেন্ট মাধ্যম নিশ্চিত করে দ্রুত অর্ডার সম্পন্ন করুন
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#f47920]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900" lang="bn">
              আপনার ব্যাগে কোনো পণ্য নেই
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground" lang="bn">
              চেকআউট করতে প্রথমে আপনার পছন্দের পণ্য কার্টে যোগ করুন।
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/products" />}
              className="h-11 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-xs"
              lang="bn"
            >
              কেনাকাটা শুরু করুন
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Delivery Address & Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Shipping Address Card */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <MapPin className="w-5 h-5 text-[#f47920]" />
                  <h2 className="text-base sm:text-lg font-bold text-gray-900" lang="bn">
                    ১. ডেলিভারির তথ্য ও ঠিকানা
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5" lang="bn">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      আপনার নাম (Full Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="পুরো নাম লিখুন"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs sm:text-sm outline-none focus:border-[#f47920] bg-gray-50/50 shadow-2xs"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5" lang="bn">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      মোবাইল নম্বর (Phone Number) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs sm:text-sm outline-none focus:border-[#f47920] bg-gray-50/50 shadow-2xs font-mono"
                    />
                  </div>

                  {/* Address Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5" lang="bn">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/ল্যান্ডমার্ক) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="যেমন: বাড়ি নং ১২, সান্নালপাড়া, সোনালী ব্যাংকের পেছনে, শেরপুর, বগুড়া"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-3 text-xs sm:text-sm outline-none focus:border-[#f47920] bg-gray-50/50 shadow-2xs resize-none leading-relaxed"
                    />
                  </div>

                  {/* Delivery Zone Selection Cards */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5" lang="bn">
                      <Truck className="w-3.5 h-3.5 text-[#f47920]" />
                      ডেলিভারি এলাকা নির্বাচন করুন <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {zones.map((zone) => {
                        const isSelected = zoneId === zone.id;
                        return (
                          <label
                            key={zone.id}
                            className={`relative flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#f47920] bg-orange-50/40 shadow-xs"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="delivery_zone"
                                value={zone.id}
                                checked={isSelected}
                                onChange={() => setZoneId(zone.id)}
                                className="h-4 w-4 text-[#f47920] focus:ring-[#f47920]"
                              />
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                                  {zone.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  ডেলিভারি চার্জ: {formatTaka(Number(zone.delivery_charge))}
                                </p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#f47920]" />}
                          </label>
                        );
                      })}
                    </div>

                    {isShippingInvalid && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs mt-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span lang="bn">
                          আপনার ব্যাগে মুদিপণ্য রয়েছে যা শুধুমাত্র শেরপুর, বগুড়ায় ডেলিভারিযোগ্য। অনুগ্রহ করে শেরপুর জোন সিলেক্ট করুন।
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Selection Card */}
              <div className="bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <CreditCard className="w-5 h-5 text-[#f47920]" />
                  <h2 className="text-base sm:text-lg font-bold text-gray-900" lang="bn">
                    ২. পেমেন্ট মাধ্যম নির্বাচন
                  </h2>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#f47920] bg-orange-50/40 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#f47920]">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900" lang="bn">
                          ক্যাশ অন ডেলিভারি (Cash on Delivery)
                        </p>
                        <p className="text-xs text-muted-foreground" lang="bn">
                          পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানকে মূল্য পরিশোধ করুন।
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-4 w-4 text-[#f47920]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement (5 cols) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              
              {/* Order Summary Box */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100" lang="bn">
                  অর্ডার সামারি ({items.length}টি আইটেম)
                </h3>

                {/* Mini Item List */}
                <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin divide-y divide-gray-50">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-3 pt-2 first:pt-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-bold text-[#f47920] bg-orange-50 px-1.5 py-0.5 rounded">
                          {item.quantity}x
                        </span>
                        <span className="text-xs text-gray-800 font-medium line-clamp-1">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0">
                        {formatTaka(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon & Wallet Input */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5" lang="bn">
                    <Tag className="w-3.5 h-3.5 text-[#f47920]" />
                    কুপন কোড (যদি থাকে)
                  </label>
                  {couponResult?.valid ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2.5 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-green-800">{couponCode.toUpperCase()}</span>
                        <span className="text-green-600">(-{couponResult.discount_percentage}%)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponResult(null);
                          setCouponCode("");
                        }}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        বাতিল
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="কুপন কোড লিখুন"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-xs uppercase outline-none focus:border-[#f47920] bg-gray-50/50"
                      />
                      <Button
                        type="button"
                        onClick={checkCoupon}
                        disabled={!couponCode.trim() || couponChecking}
                        className="h-10 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold"
                        lang="bn"
                      >
                        {couponChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "প্রয়োগ"}
                      </Button>
                    </div>
                  )}

                  {/* Wallet Checkbox if logged in and balance > 0 */}
                  {isAuthenticated && walletNumber > 0 && (
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50/50 border border-orange-200 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        className="h-4 w-4 text-[#f47920] rounded"
                      />
                      <div className="flex-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-[#f47920]" />
                          ওয়ালেট ব্যালেন্স ব্যবহার করুন
                        </span>
                        <span className="font-bold text-[#f47920]">{formatTaka(walletNumber)}</span>
                      </div>
                    </label>
                  )}
                </div>

                {/* Final Cost Breakdown */}
                <div className="space-y-2.5 text-xs sm:text-sm text-gray-700 pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span lang="bn">পণ্যের মূল্য (Subtotal):</span>
                    <span className="font-semibold text-gray-900">{formatTaka(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span lang="bn">ডেলিভারি চার্জ:</span>
                    <span className="font-semibold text-gray-900">{formatTaka(deliveryCharge)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span lang="bn">কুপন ডিসকাউন্ট:</span>
                      <span>-{formatTaka(couponDiscount)}</span>
                    </div>
                  )}

                  {walletApplied > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span lang="bn">ওয়ালেট ব্যালেন্স প্রয়োগ:</span>
                      <span>-{formatTaka(walletApplied)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="text-sm sm:text-base font-bold text-gray-900" lang="bn">
                      সর্বমোট প্রদেয় মূল্য:
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-[#f47920]">
                      {formatTaka(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  disabled={loading || items.length === 0 || isShippingInvalid}
                  className="w-full h-12 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2"
                  lang="bn"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>অর্ডার তৈরি হচ্ছে...</span>
                    </div>
                  ) : (
                    <>
                      <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Trust Badge Card */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>১০০% নিরাপদ ও নির্ভরযোগ্য ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-4 h-4 text-[#f47920] shrink-0" />
                  <span>শেরপুর, বগুড়ায় দ্রুততম সময়ে হোম ডেলিভারি</span>
                </div>
              </div>

            </div>

          </form>
        )}
      </div>
    </main>
  );
}
