"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");

    if (!token) {
      toast.error("Login failed. No token found.");
      router.push("/?auth=login");
      return;
    }

    // Clear the token from the URL history to prevent token leak
    window.history.replaceState(null, "", "/");

    const fetchUserAndLogin = async () => {
      try {
        // Fetch the user profile from the backend using the new token
        const res = await api.get<{ user: User }>("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        login(res.data.user, token);
        toast.success("Login successful");
        router.push("/");
      } catch (error) {
        console.error("Google login callback error:", error);
        toast.error("Could not complete login. Please try again.");
        router.push("/?auth=login");
      }
    };

    fetchUserAndLogin();
  }, [searchParams, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#f47920]" />
        <p className="mt-4 text-sm font-medium text-slate-600">
          Logging in, please wait...
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
