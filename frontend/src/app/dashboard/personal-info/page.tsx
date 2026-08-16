"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Save,
  KeyRound,
  CheckCircle2,
  MapPin,
  Package,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { User } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function PersonalInfoPage() {
  const { hydrated, user, isAuthenticated } = useDashboardAuth();
  const setUser = useAuthStore((s) => s.setUser);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [pwd, setPwd] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email ?? "");
    }
  }, [user]);

  if (!hydrated || !user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("অনুগ্রহ করে আপনার পুরো নাম লিখুন।");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put<{ user: User }>("/auth/profile", {
        name: name.trim(),
        email: email.trim() || undefined,
      });
      setUser(res.data.user);
      toast.success("প্রোফাইলের তথ্য সফলভাবে আপডেট হয়েছে!");
    } catch (error) {
      toast.error(getErrorMessage(error, "প্রোফাইল আপডেট ব্যর্থ হয়েছে"));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd.current_password || !pwd.password) {
      toast.error("বর্তমান ও নতুন পাসওয়ার্ড পূরণ করুন।");
      return;
    }
    if (pwd.password.length < 6) {
      toast.error("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }
    if (pwd.password !== pwd.password_confirmation) {
      toast.error("নতুন পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।");
      return;
    }

    setSavingPwd(true);
    try {
      await api.put("/auth/password", pwd);
      setPwd({ current_password: "", password: "", password_confirmation: "" });
      toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
    } catch (error) {
      toast.error(getErrorMessage(error, "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে"));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2" lang="bn">
          <UserIcon className="w-6 h-6 text-[#f47920]" />
          <span>প্রোফাইল সেটিংস ও নিরাপত্তা (Personal Info)</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
          আপনার নাম, ইমেইল এবং একাউন্টের পাসওয়ার্ড পরিবর্তন ও নিয়ন্ত্রণ করুন
        </p>
      </div>

      {/* User Info Overview Banner Card */}
      <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f47920] to-[#d46212] text-2xl font-black text-white shadow-sm">
            {user.name?.charAt(0).toUpperCase() ?? "U"}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
              <Badge className="bg-orange-50 text-[#f47920] border-orange-200 text-[10px] font-bold">
                সম্মানিত গ্রাহক
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span>{user.phone || "—"}</span>
              {user.phone && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
            </p>
            {user.email && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{user.email}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0">
          <Link
            href="/dashboard/address-book"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920] hover:border-[#f47920] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#f47920]" />
            <span>ঠিকানা বই</span>
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920] hover:border-[#f47920] transition-colors"
          >
            <Package className="w-3.5 h-3.5 text-[#f47920]" />
            <span>আমার অর্ডার</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Edit Card */}
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#f47920]" />
            <h3 className="text-base font-bold text-gray-900" lang="bn">
              ব্যক্তিগত তথ্য হালনাগাদ
            </h3>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="prof-name" className="text-xs font-bold text-gray-700" lang="bn">
                আপনার পুরো নাম *
              </Label>
              <Input
                id="prof-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: মোঃ কামরুল ইসলাম"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-email" className="text-xs font-bold text-gray-700" lang="bn">
                ইমেইল ঠিকানা (ঐচ্ছিক)
              </Label>
              <Input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="h-10 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-phone" className="text-xs font-bold text-gray-700" lang="bn">
                মোবাইল নম্বর (লগইন আইডি)
              </Label>
              <Input
                id="prof-phone"
                value={user.phone ?? "ফোন নম্বর নেই"}
                disabled
                className="h-10 rounded-xl text-xs font-mono bg-gray-50 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground">
                * মোবাইল নম্বর পরিবর্তনের জন্য হেল্পলাইনে যোগাযোগ করুন।
              </p>
            </div>

            <Button
              type="submit"
              disabled={savingProfile}
              className="w-full h-11 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? "সংরক্ষণ হচ্ছে..." : "তথ্য সংরক্ষণ করুন"}</span>
            </Button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl bg-white border border-gray-100 p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-gray-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#f47920]" />
            <h3 className="text-base font-bold text-gray-900" lang="bn">
              পাসওয়ার্ড পরিবর্তন ও নিরাপত্তা
            </h3>
          </div>

          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pwd-curr" className="text-xs font-bold text-gray-700" lang="bn">
                বর্তমান পাসওয়ার্ড *
              </Label>
              <Input
                id="pwd-curr"
                type="password"
                value={pwd.current_password}
                onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
                placeholder="••••••••"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pwd-new" className="text-xs font-bold text-gray-700" lang="bn">
                নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
              </Label>
              <Input
                id="pwd-new"
                type="password"
                value={pwd.password}
                onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
                placeholder="••••••••"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pwd-conf" className="text-xs font-bold text-gray-700" lang="bn">
                নতুন পাসওয়ার্ড নিশ্চিত করুন *
              </Label>
              <Input
                id="pwd-conf"
                type="password"
                value={pwd.password_confirmation}
                onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })}
                placeholder="••••••••"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={savingPwd}
              className="w-full h-11 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{savingPwd ? "পরিবর্তন হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করুন"}</span>
            </Button>
          </form>
        </div>

      </div>

    </div>
  );
}
