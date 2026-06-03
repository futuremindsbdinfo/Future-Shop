"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types";

type AuthTab = "login" | "register";

interface AuthSuccess {
  user: User;
  token: string;
}

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  onSuccess?: () => void;
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35 26.7 36 24 36c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C39.9 36.3 44 31 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function extractErrors(error: unknown): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  let message = "কিছু একটা সমস্যা হয়েছে";

  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as {
      response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    }).response;
    if (resp?.data?.message) message = resp.data.message;
    const errs = resp?.data?.errors;
    if (errs) {
      for (const key of Object.keys(errs)) {
        fields[key] = errs[key]?.[0] ?? "";
      }
    }
  }
  return { message, fields };
}

export function AuthModal({ open, onOpenChange, tab, onTabChange, onSuccess }: AuthModalProps) {
  const login = useAuthStore((s) => s.login);

  // login (OTP) state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // login (email + password) state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // register state
  const [name, setName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const finishAuth = (data: AuthSuccess) => {
    login(data.user, data.token);
    setErrors({});
    onOpenChange(false);
    onSuccess?.();
  };

  const sendOtp = async () => {
    setErrors({});
    if (!phone.trim()) {
      setErrors({ phone: "ফোন নম্বর দিন" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { phone });
      setOtpSent(true);
      toast.success("OTP পাঠানো হয়েছে");
    } catch (error) {
      const { message, fields } = extractErrors(error);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post<AuthSuccess>("/auth/verify-otp", { phone, otp });
      finishAuth(res.data);
    } catch (error) {
      const { message, fields } = extractErrors(error);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const emailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post<AuthSuccess>("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      finishAuth(res.data);
    } catch (error) {
      const { message, fields } = extractErrors(error);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post<AuthSuccess>("/auth/register", {
        name,
        phone: regPhone,
        email: email.trim() || undefined,
        password,
      });
      finishAuth(res.data);
      toast.success("রেজিস্ট্রেশন সফল হয়েছে");
    } catch (error) {
      const { message, fields } = extractErrors(error);
      setErrors(fields);
      if (Object.keys(fields).length === 0) toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const googlePlaceholder = () => toast.info("Google সাইন-ইন শীঘ্রই আসছে");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-[#1a6bdf]">Future Shop</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => onTabChange(v as AuthTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" lang="bn">লগইন</TabsTrigger>
            <TabsTrigger value="register" lang="bn">রেজিস্ট্রেশন</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="mt-4 space-y-4">
            <p className="text-sm font-medium" lang="bn">ফোন নম্বর দিয়ে লগইন</p>
            <div className="space-y-1">
              <Label htmlFor="login-phone" lang="bn">ফোন নম্বর</Label>
              <Input
                id="login-phone"
                className="h-11"
                type="tel"
                inputMode="tel"
                placeholder="880XXXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpSent}
              />
              {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
            </div>

            {!otpSent ? (
              <Button type="button" onClick={sendOtp} disabled={loading} className="h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span lang="bn">OTP পাঠান</span>
              </Button>
            ) : (
              <>
                <div className="space-y-1">
                  <Label htmlFor="login-otp" lang="bn">OTP কোড</Label>
                  <Input
                    id="login-otp"
                    className="h-11"
                    inputMode="numeric"
                    placeholder="৬ সংখ্যার কোড"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  {errors.otp && <p className="text-xs text-red-600">{errors.otp}</p>}
                </div>
                <Button type="button" onClick={verifyOtp} disabled={loading} className="h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <span lang="bn">যাচাই করুন</span>
                </Button>
              </>
            )}

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground" lang="bn">অথবা</span>
              <Separator className="flex-1" />
            </div>

            {/* Email + password */}
            <form onSubmit={emailLogin} className="space-y-3">
              <p className="text-sm font-medium" lang="bn">ইমেইল দিয়ে লগইন</p>
              <div className="space-y-1">
                <Label htmlFor="login-email" lang="bn">ইমেইল</Label>
                <Input
                  id="login-email"
                  className="h-11"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password" lang="bn">পাসওয়ার্ড</Label>
                <Input
                  id="login-password"
                  className="h-11"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span lang="bn">লগইন করুন</span>
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground" lang="bn">অথবা</span>
              <Separator className="flex-1" />
            </div>

            <Button type="button" variant="outline" className="h-11 w-full bg-white" onClick={googlePlaceholder}>
              <GoogleIcon />
              <span className="ml-2" lang="bn">Google দিয়ে লগইন</span>
            </Button>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register" className="mt-4 space-y-4">
            <form onSubmit={register} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="reg-name" lang="bn">নাম</Label>
                <Input id="reg-name" className="h-11" placeholder="আপনার নাম" value={name} onChange={(e) => setName(e.target.value)} required />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-phone" lang="bn">ফোন নম্বর</Label>
                <Input id="reg-phone" className="h-11" type="tel" placeholder="880XXXXXXXXXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-email" lang="bn">ইমেইল <span className="text-muted-foreground">(ঐচ্ছিক)</span></Label>
                <Input id="reg-email" className="h-11" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-password" lang="bn">পাসওয়ার্ড</Label>
                <Input id="reg-password" className="h-11" type="password" placeholder="কমপক্ষে ৮ অক্ষর" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
              </div>
              <Button type="submit" disabled={loading} className="h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span lang="bn">রেজিস্ট্রেশন করুন</span>
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground" lang="bn">অথবা</span>
              <Separator className="flex-1" />
            </div>

            <Button type="button" variant="outline" className="h-11 w-full bg-white" onClick={googlePlaceholder}>
              <GoogleIcon />
              <span className="ml-2" lang="bn">Google দিয়ে রেজিস্ট্রেশন</span>
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
