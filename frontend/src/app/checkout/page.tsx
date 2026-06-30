"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import type { DeliveryZone, Order, PaymentMethod } from "@/types";

const TK = "৳";
const formatTk = (value: number) => `${TK}${value.toLocaleString("en-US")}`;

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on Delivery" },
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState(false);

  // Coupon + wallet (Batch D-2b)
  const [couponCode, setCouponCode] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    message: string;
    discount_percentage?: number;
  } | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState("0.00");

  // Wait one tick for AuthHydrator to restore from sessionStorage before
  // deciding the user is unauthenticated (avoids a redirect race on refresh).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Protect: in-memory token means a hard refresh logs out → back to login.
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/?auth=login&next=/checkout");
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    api
      .get<{ data: DeliveryZone[] }>("/delivery-zones")
      .then((res) => {
        setZones(res.data.data);
        if (res.data.data.length > 0) setZoneId(res.data.data[0].id);
      })
      .catch(() => toast.error("ডেলিভারি জোন লোড করা যায়নি"));
  }, []);

  // Pull the user's wallet balance for the "Use wallet" toggle (Batch D-2b).
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    api
      .get<{ balance: string }>("/account/wallet")
      .then((r) => setWalletBalance(r.data.balance))
      .catch(() => {
        /* wallet may not exist yet — fine */
      });
  }, [hydrated, isAuthenticated]);

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
      }>(`/account/coupons/check?code=${encodeURIComponent(code)}`);
      setCouponResult(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setCouponResult({
        valid: false,
        message: err?.response?.data?.message ?? "Check failed",
      });
    } finally {
      setCouponChecking(false);
    }
  };

  if (!hydrated) return <LoadingSpinner fullHeight />;
  if (!isAuthenticated) {
    return <LoadingSpinner fullHeight />;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedZone = zones.find((z) => z.id === zoneId) ?? null;
  const deliveryCharge = selectedZone ? Number(selectedZone.delivery_charge) : 0;

  // Preview discount / wallet usage (the server recomputes authoritatively).
  const couponDiscount =
    couponResult?.valid && couponResult.discount_percentage
      ? Math.round((subtotal * couponResult.discount_percentage) / 100 * 100) / 100
      : 0;
  const walletNumber = Number(walletBalance) || 0;
  const subtotalPlusDelivery = subtotal + deliveryCharge;
  const amountAfterDiscount = Math.max(0, subtotalPlusDelivery - couponDiscount);
  const walletApplied =
    useWallet && walletNumber > 0
      ? Math.min(walletNumber, amountAfterDiscount)
      : 0;
  const total = Math.max(0, amountAfterDiscount - walletApplied);

  const hasGroceryItems = items.some((item) => item.isGrocery);
  const isZoneSherpur = selectedZone
    ? selectedZone.name.toLowerCase().includes("sherpur") || selectedZone.id === 1
    : false;
  const isShippingInvalid = hasGroceryItems && !isZoneSherpur;

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!zoneId) {
      toast.error("Please select a delivery zone");
      return;
    }
    if (hasGroceryItems && !isZoneSherpur) {
      toast.error("Grocery products can only be delivered to Sherpur.");
      return;
    }

    setLoading(true);
    try {
      // Sync the client cart into the server cart (the order is computed from it).
      await api.delete("/cart");
      for (const item of items) {
        await api.post("/cart/items", { product_id: item.productId, quantity: item.quantity });
      }

      const res = await api.post<{ data: Order }>("/orders", {
        shipping_name: name,
        shipping_phone: phone,
        shipping_address: address,
        delivery_zone_id: zoneId,
        payment_method: paymentMethod,
        coupon_code: couponResult?.valid ? couponCode.trim() : undefined,
        use_wallet: useWallet && walletNumber > 0 ? true : undefined,
      });

      clearCart();
      router.push(`/orders/success?order=${encodeURIComponent(res.data.data.order_number)}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to place order"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" className="h-11" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone">Delivery Zone</Label>
                <select
                  id="zone"
                  value={zoneId ?? ""}
                  onChange={(e) => setZoneId(Number(e.target.value))}
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {formatTk(Number(zone.delivery_charge))}
                    </option>
                  ))}
                </select>
                {isShippingInvalid && (
                  <p className="text-xs font-semibold text-red-600 mt-2">
                    Your cart contains grocery products that are only deliverable to Sherpur. Please select &quot;Zone A — Sherpur&quot; or remove grocery items from your cart.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coupon + Wallet (Batch D-2b) */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-semibold">Coupon &amp; Wallet</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="coupon_code">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon_code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponResult(null);
                    }}
                    placeholder="Enter coupon code"
                    className="h-11 flex-1 rounded-md border border-input bg-transparent px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    onClick={checkCoupon}
                    disabled={!couponCode.trim() || couponChecking}
                    className="h-11 bg-[#f47920] px-4 hover:bg-[#e56910]"
                  >
                    {couponChecking ? "..." : "Apply"}
                  </Button>
                </div>
                {couponResult && (
                  <p
                    className={`text-sm ${
                      couponResult.valid ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {couponResult.valid ? "✓ " : "✗ "}
                    {couponResult.message}
                  </p>
                )}
              </div>

              {walletNumber > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-input p-3">
                  <input
                    type="checkbox"
                    id="use_wallet"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="use_wallet"
                    className="flex-1 cursor-pointer text-sm"
                  >
                    Use wallet balance
                    <span className="ml-2 font-medium text-[#f47920]">
                      {formatTk(walletNumber)}
                    </span>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="font-semibold">Payment Method</h2>
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-3 has-checked:border-[#f47920]"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="font-semibold">Order Summary</h2>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatTk(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Charge</span>
                <span>{formatTk(deliveryCharge)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon discount</span>
                  <span>-{formatTk(couponDiscount)}</span>
                </div>
              )}
              {walletApplied > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Wallet applied</span>
                  <span>-{formatTk(walletApplied)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatTk(total)}</span>
              </div>
              <Button
                type="submit"
                disabled={loading || items.length === 0 || isShippingInvalid}
                className="mt-2 h-11 w-full bg-[#f47920] hover:bg-[#e56910]"
              >
                <span>Place Order</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
