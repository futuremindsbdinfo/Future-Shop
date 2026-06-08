"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

interface AuthSuccess {
  user: User;
  token: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function FumindsAdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<AuthSuccess>("/auth/login", { email, password });
      const u = res.data.user;
      if (u.role !== "admin") {
        // Reject non-admins. Do NOT save token / cookies.
        setError("Access denied. Admin only.");
        return;
      }
      // Admin verified — save auth state and redirect to dashboard.
      login(u, res.data.token);
      router.push("/admin");
    } catch (err) {
      setError(getErrorMessage(err, "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4 py-12">
      <Card className="w-full max-w-md rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <p className="mt-3 text-xl font-bold text-[#f47920]">Future Shop</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
              Admin Portal
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                className="h-11"
                type="email"
                autoComplete="username"
                placeholder="admin@futureshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                className="h-11"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white hover:opacity-90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>

            <p className="pt-2 text-center text-[11px] text-[#9ca3af]">
              Restricted area. Only authorized administrators.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
