"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    setHydrated(true);
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
  };

  const getPreview = async (codeVal: string) => {
    if (codeVal.length !== 6) {
      toast.error("ছয় সংখ্যার কোড দিন");
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
      toast.error(err?.response?.data?.message ?? "কোড সঠিক নয় বা অর্ডার আপনার নয়");
    } finally {
      setChecking(false);
    }
  };

  const fetchPreview = () => getPreview(code);

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
        toast.error("ক্যামেরা অ্যাক্সেস নেই, কোড টাইপ করুন");
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

  // Step 3 — Success.
  if (confirmed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-12">
        <Card className="rounded-xl border-green-200 shadow-sm">
          <CardContent className="space-y-4 p-8 text-center">
            <CheckCircle2 className="mx-auto h-20 w-20 text-green-600" />
            <h1 className="text-xl font-bold text-green-800" lang="bn">
              পেমেন্ট নিশ্চিত হয়েছে!
            </h1>
            <p className="text-sm text-muted-foreground" lang="bn">
              ডেলিভারি সম্পন্ন হয়েছে।
            </p>
            <Button
              onClick={() => router.push("/delivery")}
              className="h-12 w-full bg-[#f47920] hover:bg-[#e56910]"
            >
              <span lang="bn">ড্যাশবোর্ডে ফিরুন</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2 — Order preview + confirm.
  if (preview) {
    const totalNumber = Number(preview.total);
    return (
      <div className="mx-auto max-w-sm space-y-4 px-4 py-8">
        <h1 className="text-lg font-bold" lang="bn">অর্ডার যাচাই করুন</h1>

        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="space-y-3 p-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Order
              </p>
              <p className="font-mono font-semibold">{preview.order_number}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Customer
              </p>
              <p className="font-medium">{preview.customer_name}</p>
              <a
                href={`tel:${preview.customer_phone}`}
                className="text-sm text-[#f47920]"
              >
                {preview.customer_phone}
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Address
              </p>
              <p className="text-muted-foreground">{preview.address}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Items
              </p>
              <ul className="space-y-1">
                {preview.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="truncate pr-2">
                      {item.product_name} × {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-green-200 bg-green-50 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-green-800" lang="bn">
              সংগ্রহ করতে হবে
            </p>
            <p className="font-mono text-3xl font-bold text-green-700">
              {formatTaka(totalNumber)}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button
            onClick={submitConfirm}
            disabled={confirming}
            className="h-12 w-full bg-green-600 text-white hover:bg-green-700"
          >
            {confirming ? (
              <span lang="bn">কনফার্ম হচ্ছে...</span>
            ) : (
              <span lang="bn">
                কনফার্ম করুন — {formatTaka(totalNumber)} সংগ্রহ করেছি
              </span>
            )}
          </Button>
          <Button
            onClick={reset}
            variant="ghost"
            className="h-12 w-full"
            disabled={confirming}
          >
            <span lang="bn">বাতিল</span>
          </Button>
        </div>
      </div>
    );
  }

  // Step 1 — Code entry.
  return (
    <div className="mx-auto max-w-sm space-y-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-bold" lang="bn">
          পেমেন্ট কনফার্ম করুন
        </h1>
        <p className="mt-1 text-sm text-muted-foreground" lang="bn">
          গ্রাহকের কাছ থেকে ৬-সংখ্যার কোডটি নিন।
        </p>
      </div>

      {scanning ? (
        <div className="space-y-4">
          <div id="qr-reader" className="overflow-hidden rounded-lg border bg-black aspect-square max-w-sm mx-auto" />
          <Button
            type="button"
            onClick={stopScan}
            variant="outline"
            className="h-12 w-full"
          >
            <span lang="bn">স্ক্যান বন্ধ করুন</span>
          </Button>
        </div>
      ) : (
        <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
          <CardContent className="space-y-4 p-4">
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="000000"
              className="h-16 w-full rounded-md border border-input bg-transparent text-center font-mono text-4xl tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-[#f47920]"
              aria-label="6-digit payment code"
            />
            <Button
              onClick={fetchPreview}
              disabled={code.length !== 6 || checking}
              className="h-12 w-full bg-[#f47920] hover:bg-[#e56910]"
            >
              {checking ? "..." : <span lang="bn">অর্ডার খুঁজুন</span>}
            </Button>
            <Button
              type="button"
              onClick={startScan}
              variant="outline"
              className="h-12 w-full border-[#f47920] text-[#f47920] hover:bg-[#f47920]/10 flex items-center justify-center gap-2"
            >
              <Camera className="h-5 w-5" />
              <span lang="bn">QR স্ক্যান করুন</span>
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground" lang="bn">
        কোডটি গ্রাহকের অর্ডার পেজে দেখানো আছে। কোডটি QR থেকেও স্ক্যান করা যাবে।
      </p>
    </div>
  );
}
