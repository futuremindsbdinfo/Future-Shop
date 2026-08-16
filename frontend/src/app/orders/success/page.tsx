import Link from "next/link";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const orderNumber = order || "FS-2026-XXXXX";

  return (
    <main className="min-h-screen bg-[#f8fafc] py-8 md:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        
        {/* Main Success Box */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-10 border border-gray-100 shadow-md text-center space-y-6">
          
          {/* Top Celebration Icon */}
          <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-25" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-green-600 to-emerald-500 text-white shadow-lg shadow-green-600/20">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>অর্ডার সফলভাবে গৃহীত হয়েছে</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              ধন্যবাদ! আপনার অর্ডার নিশ্চিত হয়েছে
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto" lang="bn">
              আমরা আপনার অর্ডারটি পেয়েছি এবং আমাদের টিম দ্রুত ডেলিভারির প্রস্তুতি শুরু করেছে।
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-2xl bg-gray-50/80 border border-gray-200/80 p-5 space-y-3.5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500" lang="bn">অর্ডার ট্র্যাকিং নম্বর:</span>
              <span className="font-mono text-base font-bold text-[#f47920] bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200/60">
                {orderNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-[#f47920] shrink-0" />
                <span lang="bn">
                  আনুমানিক ডেলিভারি: <strong>আজকে / ২৪ ঘণ্টার মধ্যে</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span lang="bn">
                  পেমেন্ট: <strong>ক্যাশ অন ডেলিভারি</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Helpline & WhatsApp support */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-50/70 to-amber-50/70 border border-orange-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-left space-y-0.5">
              <p className="font-bold text-gray-900" lang="bn">অর্ডার সম্পর্কিত যেকোনো প্রয়োজনে:</p>
              <p className="text-muted-foreground" lang="bn">সরাসরি কল করুন বা হোয়াটসঅ্যাপে মেসেজ দিন</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:01813354648"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold hover:border-[#f47920] hover:text-[#f47920] shadow-2xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#f47920]" />
                <span>01813354648</span>
              </a>
              <a
                href={`https://wa.me/8801813354648?text=${encodeURIComponent(`হ্যালো Future Shop, আমি আমার অর্ডার (${orderNumber}) সম্পর্কে জানতে চাই।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-2xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              nativeButton={false}
              render={<Link href={`/track-order?order=${encodeURIComponent(orderNumber)}`} />}
              className="flex-1 h-12 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-sm shadow-md"
              lang="bn"
            >
              <Truck className="w-4 h-4 mr-2" />
              <span>অর্ডার ট্র্যাক করুন</span>
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/products" />}
              variant="outline"
              className="flex-1 h-12 rounded-xl border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50"
              lang="bn"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>আরও কেনাকাটা করুন</span>
            </Button>
          </div>

        </div>

      </div>
    </main>
  );
}
