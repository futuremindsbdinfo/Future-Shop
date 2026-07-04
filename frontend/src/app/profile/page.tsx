"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Address } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addr, setAddr] = useState({ recipient_name: "", phone: "", address: "", division: "", district: "" });
  const [savingAddr, setSavingAddr] = useState(false);

  const [pwd, setPwd] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [savingPwd, setSavingPwd] = useState(false);

  // Wait one tick for AuthHydrator to restore from sessionStorage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/?auth=login&next=/profile");
      return;
    }
    const t = setTimeout(() => {
      if (user) {
        setName(user.name);
        setEmail(user.email ?? "");
      }
      api.get<{ data: Address[] }>("/addresses").then((r) => setAddresses(r.data.data)).catch(() => {});
    }, 0);
    return () => clearTimeout(t);
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) return <LoadingSpinner fullHeight />;
  if (!isAuthenticated || !user) return <LoadingSpinner fullHeight />;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put<{ user: typeof user }>("/auth/profile", { name, email: email.trim() || undefined });
      setUser(res.data.user);
      toast.success("প্রোফাইল আপডেট হয়েছে");
    } catch (error) {
      toast.error(getErrorMessage(error, "আপডেট ব্যর্থ হয়েছে"));
    } finally {
      setSavingProfile(false);
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const res = await api.post<{ data: Address }>("/addresses", addr);
      setAddresses((prev) => [res.data.data, ...prev]);
      setAddr({ recipient_name: "", phone: "", address: "", division: "", district: "" });
      setShowAddrForm(false);
      toast.success("ঠিকানা যোগ হয়েছে");
    } catch (error) {
      toast.error(getErrorMessage(error, "ঠিকানা যোগ ব্যর্থ হয়েছে"));
    } finally {
      setSavingAddr(false);
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("ঠিকানা মুছে ফেলা হয়েছে");
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await api.put("/auth/password", pwd);
      setPwd({ current_password: "", password: "", password_confirmation: "" });
      toast.success("পাসওয়ার্ড পরিবর্তন হয়েছে");
    } catch (error) {
      toast.error(getErrorMessage(error, "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে"));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold" lang="bn">আমার প্রোফাইল</h1>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" lang="bn">ব্যক্তিগত তথ্য</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="p-name" lang="bn">নাম</Label>
              <Input id="p-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-phone" lang="bn">ফোন (পরিবর্তনযোগ্য নয়)</Label>
              <Input id="p-phone" className="h-11" value={user.phone ?? ""} readOnly disabled />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-email" lang="bn">ইমেইল</Label>
              <Input id="p-email" className="h-11" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={savingProfile} className="h-11 w-full bg-[#f47920] hover:bg-[#e56910] sm:w-auto">
              <span lang="bn">সংরক্ষণ করুন</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg" lang="bn">সংরক্ষিত ঠিকানা</CardTitle>
          <Button variant="outline" className="h-11" onClick={() => setShowAddrForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" /> <span lang="bn">নতুন</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {addresses.length === 0 && !showAddrForm && (
            <p className="text-sm text-muted-foreground" lang="bn">কোনো ঠিকানা সংরক্ষিত নেই।</p>
          )}
          {addresses.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
              <div className="min-w-0 text-sm">
                <p className="font-medium">{a.recipient_name} · {a.phone}</p>
                <p className="text-muted-foreground">{a.address}{a.district ? `, ${a.district}` : ""}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-red-600" onClick={() => deleteAddress(a.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {showAddrForm && (
            <form onSubmit={addAddress} className="space-y-3 rounded-md border p-3">
              <Input className="h-11" placeholder="প্রাপকের নাম" value={addr.recipient_name} onChange={(e) => setAddr({ ...addr, recipient_name: e.target.value })} required />
              <Input className="h-11" type="tel" placeholder="ফোন নম্বর" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} required />
              <textarea className="flex min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="সম্পূর্ণ ঠিকানা" rows={2} value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input className="h-11" placeholder="বিভাগ" value={addr.division} onChange={(e) => setAddr({ ...addr, division: e.target.value })} />
                <Input className="h-11" placeholder="জেলা" value={addr.district} onChange={(e) => setAddr({ ...addr, district: e.target.value })} />
              </div>
              <Button type="submit" disabled={savingAddr} className="h-11 w-full bg-[#f47920] hover:bg-[#e56910]">
                <span lang="bn">ঠিকানা সংরক্ষণ</span>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg" lang="bn">পাসওয়ার্ড পরিবর্তন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cur-pwd" lang="bn">বর্তমান পাসওয়ার্ড</Label>
              <Input id="cur-pwd" className="h-11" type="password" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-pwd" lang="bn">নতুন পাসওয়ার্ড</Label>
              <Input id="new-pwd" className="h-11" type="password" value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conf-pwd" lang="bn">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input id="conf-pwd" className="h-11" type="password" value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} required />
            </div>
            <Button type="submit" disabled={savingPwd} className="h-11 w-full bg-[#f47920] hover:bg-[#e56910] sm:w-auto">
              <span lang="bn">পরিবর্তন করুন</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
