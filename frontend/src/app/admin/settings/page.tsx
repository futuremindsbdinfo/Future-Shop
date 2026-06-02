"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import type { Banner, SiteSettings } from "@/types";

const MAX_BYTES = 5 * 1024 * 1024;

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Future Shop",
    site_tagline: "",
    contact_phone: "",
    contact_email: "",
    contact_address: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bTitle, setBTitle] = useState("");
  const [bLink, setBLink] = useState("");
  const [bFile, setBFile] = useState<File | null>(null);
  const [bActive, setBActive] = useState(true);
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get<{ data: SiteSettings }>("/admin/settings").then((r) => {
        const d = r.data.data;
        setSettings({
          site_name: d.site_name ?? "Future Shop",
          site_tagline: d.site_tagline ?? "",
          contact_phone: d.contact_phone ?? "",
          contact_email: d.contact_email ?? "",
          contact_address: d.contact_address ?? "",
        });
      }),
      api.get<{ data: Banner[] }>("/admin/banners").then((r) => setBanners(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullHeight />;

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put("/admin/settings", settings);
      toast.success("সেটিংস সংরক্ষিত হয়েছে");
    } catch (error) {
      toast.error(getErrorMessage(error, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSavingSettings(false);
    }
  };

  const addBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bFile) {
      toast.error("শিরোনাম ও ছবি দিন");
      return;
    }
    if (bFile.size > MAX_BYTES) {
      toast.error("ছবি সর্বোচ্চ ৫MB");
      return;
    }
    const form = new FormData();
    form.append("title", bTitle);
    form.append("image", bFile);
    if (bLink) form.append("link_url", bLink);
    form.append("is_active", bActive ? "1" : "0");

    setSavingBanner(true);
    try {
      const res = await api.post<{ data: Banner }>("/admin/banners", form);
      setBanners((prev) => [res.data.data, ...prev]);
      setBTitle("");
      setBLink("");
      setBFile(null);
      toast.success("ব্যানার যোগ হয়েছে");
    } catch (error) {
      toast.error(getErrorMessage(error, "ব্যানার যোগ ব্যর্থ হয়েছে"));
    } finally {
      setSavingBanner(false);
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("ব্যানার মুছে ফেলা হয়েছে");
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Site settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Site Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="s-name">Site name</Label>
              <Input id="s-name" className="h-11" value={settings.site_name ?? ""} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="s-tagline" lang="bn">ট্যাগলাইন (বাংলা)</Label>
              <Input id="s-tagline" className="h-11" value={settings.site_tagline ?? ""} onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="s-phone">Contact phone</Label>
                <Input id="s-phone" className="h-11" value={settings.contact_phone ?? ""} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="s-email">Contact email</Label>
                <Input id="s-email" className="h-11" type="email" value={settings.contact_email ?? ""} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="s-address">Contact address</Label>
              <Input id="s-address" className="h-11" value={settings.contact_address ?? ""} onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })} />
            </div>
            <Button type="submit" disabled={savingSettings} className="h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd] sm:w-auto">Save Settings</Button>
          </form>
        </CardContent>
      </Card>

      {/* Banners */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Banner Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {banners.length === 0 && <p className="text-sm text-muted-foreground">No banners yet.</p>}
          {banners.map((b) => (
            <div key={b.id} className="flex items-center gap-3 rounded-md border p-2">
              <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded bg-muted">
                <Image src={b.image} alt={b.title} fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.title}</p>
                <Badge variant="outline" className={b.is_active ? "border-green-300 text-green-700" : "border-gray-300 text-gray-500"}>
                  {b.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-red-600" onClick={() => deleteBanner(b.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <form onSubmit={addBanner} className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">Add banner</p>
            <Input className="h-11" placeholder="Title" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
            <Input className="h-11" placeholder="Link URL (optional)" value={bLink} onChange={(e) => setBLink(e.target.value)} />
            <Input className="h-11" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setBFile(e.target.files?.[0] ?? null)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bActive} onChange={(e) => setBActive(e.target.checked)} /> Active
            </label>
            <Button type="submit" disabled={savingBanner} className="h-11 w-full bg-[#1a6bdf] hover:bg-[#1559bd]">Add Banner</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
