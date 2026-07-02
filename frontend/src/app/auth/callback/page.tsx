"use client";

import { useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

/** Backend OAuth rejections arrive as ?error=<key> — mapped to Bengali copy. */
const ERROR_MESSAGES: Record<string, string> = {
  email_unverified:
    "আপনার Google ইমেইলটি verify করা নেই। Google-এ ইমেইল verify করে আবার চেষ্টা করুন।",
  account_inactive:
    "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। সাহায্যের জন্য আমাদের সাথে যোগাযোগ করুন।",
};

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const hasProcessed = useRef(false);

  // Derived straight from the URL (no state): when present we only render the
  // error UI below — no token flow runs at all.
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam) return; // error UI rendered below; nothing to process
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    // The backend no longer puts the token in the URL — it sends a one-time,
    // 60-second exchange code that we swap for the token server-side.
    const code = searchParams.get("code");

    if (!code) {
      toast.error("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      router.push("/?auth=login");
      return;
    }

    // Strip the one-time code from the URL/history immediately.
    window.history.replaceState(null, "", "/auth/callback");

    const exchangeAndLogin = async () => {
      try {
        // Swap the single-use code for the real token (token never touches the URL).
        const ex = await api.post<{ token: string }>("/auth/social/exchange", { code });
        const token = ex.data.token;

        // Fetch the user profile with the fresh token, then finish login.
        const res = await api.get<{ user: User }>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        login(res.data.user, token);
        toast.success("লগইন সফল হয়েছে");
        router.push("/");
      } catch {
        toast.error("লগইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।");
        router.push("/?auth=login");
      }
    };

    exchangeAndLogin();
  }, [errorParam, searchParams, router, login]);

  if (errorParam) {
    const message =
      ERROR_MESSAGES[errorParam] ?? "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm font-medium text-slate-700" lang="bn">
            {message}
          </p>
          <Link
            href="/?auth=login"
            lang="bn"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#f47920] px-5 text-sm font-medium text-white transition-colors hover:bg-[#e56910]"
          >
            লগইন পাতায় ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#f47920]" />
        <p className="mt-4 text-sm font-medium text-slate-600" lang="bn">
          লগইন হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
          <Loader2 className="h-10 w-10 animate-spin text-[#f47920]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
