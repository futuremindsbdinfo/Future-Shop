"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Phone,
  PhoneCall,
  MessageCircle,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/utils";
import api from "@/lib/api";
import type { Order, OrderStatus } from "@/types";

const ORDER_STEPS: { status: OrderStatus | "confirmed"; label: string; desc: string }[] = [
  { status: "pending", label: "অর্ডার গৃহীত", desc: "আপনার অর্ডারটি সিস্টেমে যোগ হয়েছে" },
  { status: "confirmed", label: "অর্ডার নিশ্চিত", desc: "অর্ডারটি যাচাই ও প্রস্তুত করা হচ্ছে" },
  { status: "processing", label: "প্রস্তুতি চলছে", desc: "পণ্য প্যাকিং সম্পন্ন হয়েছে" },
  { status: "shipped", label: "ডেলিভারির পথে", desc: "রাইডার ডেলিভারির উদ্দেশ্যে রওনা হয়েছে" },
  { status: "delivered", label: "ডেলিভারি সম্পন্ন", desc: "পণ্য সফলভাবে কাস্টমারের হাতে পৌঁছেছে" },
];

function getStepIndex(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
}

function OrderTrackerContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get("order") || "";

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim()) {
      setError("অনুগ্রহ করে আপনার অর্ডার নম্বর লিখুন");
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setError("অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await api.get<{ data: Order }>(
        `/orders/track?order_number=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      setOrder(res.data.data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(
        errorObj.response?.data?.message ||
          "প্রদত্ত অর্ডার নম্বর অথবা মোবাইল নম্বরের সাথে কোনো অর্ডার মিল পাওয়া যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Tracker Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto space-y-5">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f47920] flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900" lang="bn">
            অর্ডারের বর্তমান অবস্থা জানুন
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground" lang="bn">
            আপনার অর্ডার নম্বর ও মোবাইল নম্বর দিয়ে লাইভ ট্র্যাকিং করুন
          </p>
        </div>

        <form onSubmit={handleTrack} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700" lang="bn">
              অর্ডার নম্বর (Order Number) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: FS-2026-XXXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs sm:text-sm font-mono outline-none focus:border-[#f47920] bg-gray-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700" lang="bn">
              মোবাইল নম্বর (Phone Number) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="অর্ডার দেওয়ার সময় ব্যবহৃত ফোন নম্বর (01XXXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-xs sm:text-sm font-mono outline-none focus:border-[#f47920] bg-gray-50/50"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            lang="bn"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>ট্র্যাক করুন (Track Order)</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Track Result Display */}
      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md max-w-3xl mx-auto space-y-6">
          
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold text-gray-500" lang="bn">অর্ডার ট্র্যাকিং নম্বর:</span>
              <p className="font-mono text-xl font-extrabold text-[#f47920]">{order.order_number}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{new Date(order.created_at).toLocaleDateString("bn-BD")}</span>
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.order_status === "cancelled" ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-1">
              <p className="font-bold text-red-700" lang="bn">❌ এই অর্ডারটি বাতিল করা হয়েছে</p>
              <p className="text-xs text-red-600" lang="bn">বিস্তারিত জানতে আমাদের হেল্পলাইনে যোগাযোগ করুন।</p>
            </div>
          ) : (
            <div className="py-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6" lang="bn">
                ডেলিভারি অগ্রগতি (Delivery Progress)
              </h3>
              <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-0">
                {ORDER_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(order.order_status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={step.status}
                      className="flex md:flex-col items-center md:text-center gap-3 md:gap-2 flex-1 relative z-10"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isDone
                            ? "bg-[#f47920] text-white"
                            : "bg-gray-100 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-orange-100" : ""}`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-gray-500 hidden md:block">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            {/* Delivery Address */}
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 pb-1">
                <MapPin className="w-4 h-4 text-[#f47920]" />
                <span lang="bn">ডেলিভারির ঠিকানা:</span>
              </div>
              <p className="font-semibold text-gray-800">{order.shipping_name}</p>
              <p className="text-gray-600">{order.shipping_phone}</p>
              <p className="text-gray-600 leading-relaxed">{order.shipping_address}</p>
            </div>

            {/* Payment & Amount */}
            <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 pb-1">
                <CreditCard className="w-4 h-4 text-[#f47920]" />
                <span lang="bn">পেমেন্ট ও বিল বিবরণ:</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span lang="bn">পেমেন্ট মেথড:</span>
                <strong className="text-gray-800">ক্যাশ অন ডেলিভারি</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span lang="bn">ডেলিভারি চার্জ:</span>
                <span>{formatTaka(Number(order.delivery_charge))}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 font-bold text-sm text-gray-900">
                <span lang="bn">সর্বমোট মূল্য:</span>
                <span className="text-[#f47920]">{formatTaka(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5" lang="bn">
              <Package className="w-4 h-4 text-[#f47920]" />
              অর্ডারকৃত পণ্যসমূহ:
            </h4>
            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
              {order.items?.map((item) => (
                <div key={item.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#f47920] flex items-center justify-center text-xs font-bold">
                      {item.quantity}x
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{item.product_name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{formatTaka(Number(item.subtotal))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href="tel:01813354648"
              className="flex-1 h-11 rounded-xl border border-gray-200 flex items-center justify-center gap-2 text-xs font-bold text-gray-800 hover:border-[#f47920] hover:text-[#f47920] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#f47920]" />
              <span>হেল্পলাইন: 01813354648</span>
            </a>
            <a
              href={`https://wa.me/8801813354648?text=${encodeURIComponent(`হ্যালো Future Shop, আমি আমার অর্ডার (${order.order_number}) এর স্ট্যাটাস জানতে চাই।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp সহায়তা</span>
            </a>
          </div>

        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] py-6 md:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        <Breadcrumbs items={[{ label: "অর্ডার ট্র্যাকিং" }]} />
        <Suspense fallback={<div className="py-20 text-center text-sm text-gray-400">লোড হচ্ছে...</div>}>
          <OrderTrackerContent />
        </Suspense>
      </div>
    </main>
  );
}
