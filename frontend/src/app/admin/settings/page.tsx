"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import type { Banner, SiteSettings } from "@/types";

const MAX_BYTES = 5 * 1024 * 1024;
const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none min-h-[64px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

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
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bTitle, setBTitle] = useState("");
  const [bLink, setBLink] = useState("");
  const [bFile, setBFile] = useState<File | null>(null);
  const [bActive, setBActive] = useState(true);
  const [bPreviewUrl, setBPreviewUrl] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          site_logo: d.site_logo ?? "",
        });
        if (d.site_logo) setLogoPreview(d.site_logo);
      }),
      api.get<{ data: Banner[] }>("/admin/banners").then((r) => setBanners(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  // Revoke any blob URL when the preview changes or the component unmounts —
  // avoids a leak when the user picks several files in a row.
  useEffect(() => {
    if (!bPreviewUrl && !logoPreview) return;
    return () => {
      if (bPreviewUrl) URL.revokeObjectURL(bPreviewUrl);
      if (logoPreview && logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [bPreviewUrl, logoPreview]);

  if (loading) return <LoadingSpinner fullHeight />;

  const saveSettings = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (settings.site_name) fd.append("site_name", settings.site_name);
      if (settings.site_tagline) fd.append("site_tagline", settings.site_tagline);
      if (settings.contact_phone) fd.append("contact_phone", settings.contact_phone);
      if (settings.contact_email) fd.append("contact_email", settings.contact_email);
      if (settings.contact_address) fd.append("contact_address", settings.contact_address);
      if (logoFile) fd.append("site_logo", logoFile);
      
      fd.append("_method", "PUT");
      
      await api.post("/admin/settings", fd);
      toast.success("সেটিংস সংরক্ষিত হয়েছে");
    } catch (error) {
      toast.error(getErrorMessage(error, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setBFile(file);
    setBPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const addBanner = async () => {
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
      // Full form reset including the file input DOM and the active checkbox.
      setBTitle("");
      setBLink("");
      setBFile(null);
      setBActive(true);
      setBPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">সেটিংস</h1>
      </div>

      {/* ── Card 1: Site Info ── */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">সাইটের তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="site_name">
              সাইটের নাম
            </label>
            <Input
              id="site_name"
              className="h-11"
              value={settings.site_name ?? ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, site_name: e.target.value }))
              }
              placeholder="Future Shop"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">সাইটের লোগো</label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="relative h-14 w-auto border rounded bg-white p-1">
                  <img src={logoPreview} alt="Logo" className="object-contain h-full w-auto max-w-[150px]" />
                  <button
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="max-w-[250px]"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">সুপারিশকৃত: png/webp, স্বচ্ছ ব্যাকগ্রাউন্ড, সর্বোচ্চ ৫MB</p>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="site_tagline">
              ট্যাগলাইন (বাংলা)
            </label>
            <textarea
              id="site_tagline"
              value={settings.site_tagline ?? ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, site_tagline: e.target.value }))
              }
              rows={2}
              placeholder="বাজারে নয়, বাজার আসবে আপনার ঘরে।"
              className={TEXTAREA_CLASS}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Card 2: Contact ── */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">যোগাযোগের তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="contact_phone">
                ফোন নম্বর
              </label>
              <Input
                id="contact_phone"
                className="h-11"
                type="tel"
                value={settings.contact_phone ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contact_phone: e.target.value }))
                }
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="contact_email">
                ইমেইল
              </label>
              <Input
                id="contact_email"
                className="h-11"
                type="email"
                value={settings.contact_email ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contact_email: e.target.value }))
                }
                placeholder="info@futureshop.com"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="contact_address">
              ঠিকানা
            </label>
            <textarea
              id="contact_address"
              value={settings.contact_address ?? ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, contact_address: e.target.value }))
              }
              rows={2}
              placeholder="শেরপুর, বগুড়া, বাংলাদেশ"
              className={TEXTAREA_CLASS}
            />
          </div>

          {/* Save button covers BOTH Card 1 and Card 2 (single PUT). */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="h-11 min-w-[140px] bg-[#f47920] hover:bg-orange-600"
            >
              {saving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Banner List ── */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ব্যানার তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <EmptyState
              icon={<ImageOff className="h-7 w-7" />}
              title="কোনো ব্যানার নেই"
              description="নিচের ফর্ম থেকে নতুন ব্যানার যোগ করুন।"
            />
          ) : (
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-3 rounded-lg border border-[#f1f5f9] p-3"
                >
                  {banner.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="h-12 w-20 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-20 flex-shrink-0 rounded bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{banner.title}</p>
                    {banner.link_url && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        🔗 {banner.link_url}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      banner.is_active
                        ? "flex-shrink-0 bg-green-100 text-green-800 hover:bg-green-100"
                        : "flex-shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-100"
                    }
                  >
                    {banner.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                  <Button
                    onClick={() => deleteBanner(banner.id)}
                    variant="ghost"
                    className="h-10 w-10 flex-shrink-0 p-0 text-red-500"
                    aria-label={`Delete ${banner.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 4: Add New Banner ── */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">নতুন ব্যানার যোগ করুন</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="banner_title">
                শিরোনাম <span className="text-red-500">*</span>
              </label>
              <Input
                id="banner_title"
                className="h-11"
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="গ্রীষ্মকালীন অফার"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="banner_link">
                লিংক URL (ঐচ্ছিক)
              </label>
              <Input
                id="banner_link"
                className="h-11"
                value={bLink}
                onChange={(e) => setBLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="banner_file">
              ছবি <span className="text-red-500">*</span>
            </label>
            <input
              id="banner_file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPickFile}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#f47920] file:px-3 file:text-sm file:text-white"
            />
            {bPreviewUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={bPreviewUrl}
                alt="Preview"
                className="mt-2 h-24 w-40 rounded-md border border-input object-cover"
              />
            )}
            <p className="text-xs text-muted-foreground">
              JPG, PNG বা WebP, সর্বোচ্চ 5MB
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="bActive"
              checked={bActive}
              onChange={(e) => setBActive(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="bActive" className="text-sm font-medium">
              সঙ্গে সঙ্গে সক্রিয় করুন
            </label>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={addBanner}
              disabled={savingBanner || !bTitle.trim() || !bFile}
              className="h-11 min-w-[140px] bg-[#f47920] hover:bg-orange-600"
            >
              {savingBanner ? "যোগ হচ্ছে..." : "ব্যানার যোগ করুন"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
