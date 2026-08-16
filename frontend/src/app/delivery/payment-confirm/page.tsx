"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Camera,
  Receipt,
  Calendar,
  CreditCard,
  ArrowRight,
  PhoneCall,
  MapPin,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  ArrowLeft,
  X,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatTaka } from "@/lib/utils";

interface PreviewItem {
  product_name: string;
  quantity: number;
  price: string;
}

interface PreviewData {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  total: string;
  items: PreviewItem[];
}

export default function DeliveryPaymentConfirmPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // One-tick hydration gate.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== "delivery") {
      router.replace("/delivery");
    }
  }, [hydrated, isAuthenticated, user, router]);

  // Flow state.
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // QR Scanning States
  const [scanning, setScanning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (hydrated && !preview && !confirmed && !scanning) {
      inputRef.current?.focus();
    }
  }, [hydrated, preview, confirmed, scanning]);

  const onCodeChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) {
      getPreview(digits);
    }
  };

  const getPreview = async (codeVal: string) => {
    if (codeVal.length !== 6) {
      toast.error("অনুগ্রহ করে ৬ সংখ্যার ওটিপি কোড দিন");
      return;
    }
    setChecking(true);
    try {
      const res = await api.get<PreviewData>(
        `/delivery/payment-confirm?code=${encodeURIComponent(codeVal)}`,
      );
      setPreview(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "কোডটি সঠিক নয় অথবা এই অর্ডারটি আপনার জন্য বরাদ্দ নয়");
    } finally {
      setChecking(false);
    }
  };

  const startScan = () => {
    setScanning(true);
    setTimeout(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Html5Qrcode } = require("html5-qrcode");
        const html5Qrcode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            const cleaned = decodedText.trim();
            if (/^\d{6}$/.test(cleaned)) {
              setCode(cleaned);
              stopScan();
              getPreview(cleaned);
            } else {
              toast.error("ভুল কিউআর কোড স্ক্যান করা হয়েছে!");
            }
          },
          () => {
            // Ignore scan failures
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("ক্যামেরা চালু করা যায়নি, কোড টাইপ করুন");
        setScanning(false);
      }
    }, 100);
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error("Stop error:", err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // Cleanup scanner on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const submitConfirm = async () => {
    if (!preview) return;
    setConfirming(true);
    try {
      await api.post("/delivery/payment-confirm", { code });
      setConfirmed(true);
      toast.success("পেমেন্ট ও ডেলিভারি সফলভাবে কনফার্ম হয়েছে!");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "কনফার্ম করা যায়নি");
      setPreview(null);
      setCode("");
    } finally {
      setConfirming(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setCode("");
  };

  if (!hydrated || !isAuthenticated || user?.role !== "delivery") {
    return <LoadingSpinner fullHeight />;
  }

  // STEP 3: Payment & Delivery Success Digital Receipt
  if (confirmed && preview) {
    const totalNumber = Number(preview.total);
    const dateStr = new Date().toLocaleString("bn-BD");

    return (
      <div className="mx-auto max-w-md py-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-gray-900" lang="bn">
              পেমেন্ট ও ডেলিভারি সফল!
            </h1>
            <p className="text-xs text-muted-foreground" lang="bn">
              ক্যাশ আদায় সম্পন্ন হয়েছে এবং অর্ডারটি ডেলিভার্ড হিসেবে মার্ক করা হয়েছে।
            </p>
            <p className="text-2xl font-black text-emerald-600 pt-1">
              {formatTaka(totalNumber)} আদায়কৃত
            </p>
          </div>

          {/* Digital Receipt Details */}
          <div className="border-t border-dashed border-gray-200 pt-5 space-y-3.5 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Receipt className="w-3.5 h-3.5 text-[#f47920]" />
                <span>অর্ডার নম্বর:</span>
              </span>
              <span className="font-mono font-extrabold text-gray-900">{preview.order_number}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>তারিখ ও সময়:</span>
              </span>
              <span className="font-medium text-gray-700">{dateStr}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span>পেমেন্ট মাধ্যম:</span>
              </span>
              <span className="font-bold text-gray-900" lang="bn">ক্যাশ অন ডেলিভারি (নগদ)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>গৃহীতার নাম:</span>
              </span>
              <span className="font-bold text-gray-900">{preview.customer_name}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => router.push("/delivery")}
              className="h-12 w-full bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <span>ডেলিভারি ড্যাশবোর্ডে ফিরে যান</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Order Preview & Confirm Cash Receipt
  if (preview) {
    const totalNumber = Number(preview.total);

    return (
      <div className="mx-auto max-w-md space-y-4 py-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <h1 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>অর্ডার ও গ্রাহকের তথ্য যাচাই</span>
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-8 px-2.5 rounded-lg text-xs font-bold text-gray-500 hover:text-red-600"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            <span>বাতিল</span>
          </Button>
        </div>

        {/* Customer & Order Details Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="font-mono text-sm font-black text-[#f47920]">{preview.order_number}</span>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 text-[10px] font-bold">
              ক্যাশ অন ডেলিভারি
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-extrabold text-gray-900">{preview.customer_name}</p>
            <p className="text-gray-600 leading-relaxed flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span>{preview.address}</span>
            </p>
          </div>

          {preview.customer_phone && (
            <a
              href={`tel:${preview.customer_phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200/60"
            >
              <PhoneCall className="w-3.5 h-3.5 text-green-600" />
              <span>{preview.customer_phone} (কল করুন)</span>
            </a>
          )}

          {/* Items Summary */}
          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            <p className="font-bold text-gray-700">পণ্যসমূহ ({preview.items.length}টি):</p>
            <ul className="space-y-1 text-gray-600">
              {preview.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span className="truncate pr-2">{item.product_name}</span>
                  <span className="font-bold text-gray-800 shrink-0">{item.quantity}টি</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Big Cash Collection Card */}
        <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50/80 p-5 text-center space-y-1 shadow-sm">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider" lang="bn">
            কাস্টমারের কাছ থেকে নগদ গ্রহণ করুন:
          </p>
          <p className="font-mono text-3xl sm:text-4xl font-black text-emerald-700">
            {formatTaka(totalNumber)}
          </p>
        </div>

        {/* Confirmation Button */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={submitConfirm}
            disabled={confirming}
            className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {confirming ? "কনফার্ম হচ্ছে..." : `হ্যাঁ, ${formatTaka(totalNumber)} ক্যাশ গ্রহণ করেছি ✓`}
            </span>
          </Button>
        </div>
      </div>
    );
  }

  // STEP 1: 6-Digit OTP Code Entry or QR Scanner
  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#f47920] flex items-center justify-center mx-auto shadow-2xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight" lang="bn">
          ডেলিভারি কোড কনফার্মেশন
        </h1>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto" lang="bn">
          গ্রাহকের মোবাইলে থাকা ৬-সংখ্যার ওটিপি কোডটি টাইপ করুন অথবা কিউআর কোড স্ক্যান করুন।
        </p>
      </div>

      {scanning ? (
        <div className="space-y-4 bg-white rounded-3xl p-5 border border-gray-200 shadow-sm text-center">
          <div id="qr-reader" className="overflow-hidden rounded-2xl border bg-black aspect-square max-w-xs mx-auto" />
          <Button
            variant="outline"
            onClick={stopScan}
            className="h-10 px-6 rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            <span>ক্যামেরা স্ক্যানার বন্ধ করুন</span>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          {/* 6-Digit OTP Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block text-center" lang="bn">
              ৬-ডিজিট কোড লিখুন
            </label>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="••••••"
              className="w-full h-14 rounded-2xl border-2 border-orange-200 bg-orange-50/30 text-center font-mono text-3xl font-black tracking-[0.4em] text-[#f47920] outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all shadow-inner"
            />
          </div>

          <Button
            onClick={() => getPreview(code)}
            disabled={code.length !== 6 || checking}
            className="h-12 w-full rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{checking ? "যাচাই করা হচ্ছে..." : "অর্ডার যাচাই করুন →"}</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-gray-400 uppercase">অথবা</span>
          </div>

          {/* Camera QR Scanner Button */}
          <Button
            type="button"
            variant="outline"
            onClick={startScan}
            className="h-12 w-full rounded-xl border-gray-200 text-gray-700 hover:border-[#f47920] hover:text-[#f47920] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
          >
            <Camera className="w-4 h-4 text-[#f47920]" />
            <span>ক্যামেরা দিয়ে QR Code স্ক্যান করুন</span>
          </Button>
        </div>
      )}
    </div>
  );
}
