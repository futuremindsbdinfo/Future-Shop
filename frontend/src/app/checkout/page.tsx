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
  { value: "cod", label: "ক্যাশ অন ডেলিভারি" },
  { value: "bkash", label: "বিকাশ" },
  { value: "nagad", label: "নগদ" },
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

  // Protect: in-memory token means a hard refresh logs out → back to login.
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/?auth=login&next=/checkout");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    api
      .get<{ data: DeliveryZone[] }>("/delivery-zones")
      .then((res) => {
        setZones(res.data.data);
        if (res.data.data.length > 0) setZoneId(res.data.data[0].id);
      })
      .catch(() => toast.error("ডেলিভারি জোন লোড করা যায়নি"));
  }, []);

  if (!isAuthenticated) {
    return <LoadingSpinner fullHeight />;
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedZone = zones.find((z) => z.id === zoneId) ?? null;
  const deliveryCharge = selectedZone ? Number(selectedZone.delivery_charge) : 0;
  const total = subtotal + deliveryCharge;

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("আপনার কার্ট খালি");
      return;
    }
    if (!zoneId) {
      toast.error("ডেলিভারি জোন নির্বাচন করুন");
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
      });

      clearCart();
      router.push(`/orders/success?order=${encodeURIComponent(res.data.data.order_number)}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "অর্ডার দেওয়া যায়নি"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" lang="bn">চেকআউট</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="name" lang="bn">পুরো নাম</Label>
                <Input id="name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" lang="bn">ফোন নম্বর</Label>
                <Input id="phone" className="h-11" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" lang="bn">সম্পূর্ণ ঠিকানা</Label>
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
                <Label htmlFor="zone" lang="bn">ডেলিভারি জোন</Label>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="font-semibold" lang="bn">পেমেন্ট পদ্ধতি</h2>
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-3 has-checked:border-[#1a6bdf]"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                  />
                  <span lang="bn">{option.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>
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
                <span>{formatTk(deliveryCharge)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span lang="bn">মোট</span>
                <span>{formatTk(total)}</span>
              </div>
              <Button
                type="submit"
                disabled={loading || items.length === 0}
                className="mt-2 h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]"
              >
                <span lang="bn">অর্ডার দিন</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
