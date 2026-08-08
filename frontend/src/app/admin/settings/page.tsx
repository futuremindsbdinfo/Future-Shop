"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Globe,
  ImageOff,
  ImagePlus,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Store,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
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

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

/* ─────────────── Reusable: Icon Input Wrapper ─────────────── */
function IconInput({
  icon: Icon,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  icon: React.ElementType;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        id={id}
        type={type}
        className="h-11 pl-10 transition-all duration-200 focus:ring-2 focus:ring-[#f47920]/20 focus:border-[#f47920]"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ─────────────── Reusable: Section Header ─────────────── */
function SectionHeader({
  icon: Icon,
  title,
  description,
  accentColor = "#f47920",
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  accentColor?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-4 rounded-t-xl border-b px-6 py-4"
      style={{
        background: `linear-gradient(135deg, ${accentColor}08 0%, ${accentColor}03 100%)`,
        borderBottomColor: `${accentColor}15`,
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}08 100%)`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-gray-800" lang="bn">{title}</h3>
          {badge}
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500" lang="bn">{description}</p>
        )}
      </div>
    </div>
  );
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
  const [logoDragOver, setLogoDragOver] = useState(false);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bTitle, setBTitle] = useState("");
  const [bLink, setBLink] = useState("");
  const [bFile, setBFile] = useState<File | null>(null);
  const [bActive, setBActive] = useState(true);
  const [bPreviewUrl, setBPreviewUrl] = useState<string | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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

  // Revoke any blob URL when the preview changes or the component unmounts
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
      toast.success("সেটিংস সংরক্ষিত হয়েছে ✓");
    } catch (error) {
      toast.error(getErrorMessage(error, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLogoDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
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
      setBTitle("");
      setBLink("");
      setBFile(null);
      setBActive(true);
      setBPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("ব্যানার যোগ হয়েছে ✓");
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
    <div className="space-y-6 max-w-4xl">
      {/* ═══════════ PAGE HEADER ═══════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f47920] via-[#fb923c] to-[#f59e0b] px-6 py-6 text-white shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-white/70 mb-0.5">Admin Panel</p>
            <h1 className="text-2xl font-bold tracking-tight" lang="bn">সেটিংস</h1>
            <p className="text-sm text-white/80 mt-0.5" lang="bn">
              সাইটের তথ্য, যোগাযোগ ও ব্যানার পরিচালনা করুন
            </p>
          </div>
        </div>
        {/* Decorative */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute left-1/2 -bottom-10 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* ═══════════ CARD 1: Site Info ═══════════ */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <SectionHeader
          icon={Store}
          title="সাইটের তথ্য"
          description="সাইটের নাম, লোগো ও ট্যাগলাইন কনফিগার করুন"
          accentColor="#f47920"
        />
        <div className="space-y-5 p-6">
          {/* Site Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="site_name" lang="bn">
              সাইটের নাম
            </label>
            <IconInput
              icon={Type}
              id="site_name"
              value={settings.site_name ?? ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, site_name: e.target.value }))
              }
              placeholder="Future Shop"
            />
          </div>

          {/* Logo Upload — Drag & Drop */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" lang="bn">সাইটের লোগো</label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {logoPreview && (
                <div className="relative group">
                  <div className="h-20 w-auto rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-2 transition-colors group-hover:border-[#f47920]/40">
                    <img src={logoPreview} alt="Logo" className="object-contain h-full w-auto max-w-[160px]" />
                  </div>
                  <button
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div
                className={`flex-1 w-full cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200 ${
                  logoDragOver
                    ? "border-[#f47920] bg-[#f47920]/5"
                    : "border-gray-200 bg-gray-50 hover:border-[#f47920]/40 hover:bg-[#f47920]/5"
                }`}
                onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
                onDragLeave={() => setLogoDragOver(false)}
                onDrop={handleLogoDrop}
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-600" lang="bn">ক্লিক করুন বা ড্র্যাগ করুন</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPEG, WebP · সর্বোচ্চ ৫MB</p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setLogoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="site_tagline" lang="bn">
              ট্যাগলাইন (বাংলা)
            </label>
            <div className="relative">
              <textarea
                id="site_tagline"
                value={settings.site_tagline ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, site_tagline: e.target.value }))
                }
                rows={2}
                placeholder="বাজারে নয়, বাজার আসবে আপনার ঘরে।"
                className="flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm resize-none min-h-[64px] placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47920]/20 focus-visible:border-[#f47920] transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ CARD 2: Contact ═══════════ */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <SectionHeader
          icon={Phone}
          title="যোগাযোগের তথ্য"
          description="ফোন, ইমেইল ও ঠিকানা আপডেট করুন"
          accentColor="#3b82f6"
        />
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="contact_phone" lang="bn">
                ফোন নম্বর
              </label>
              <IconInput
                icon={Phone}
                id="contact_phone"
                type="tel"
                value={settings.contact_phone ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contact_phone: e.target.value }))
                }
                placeholder="01XXXXXXXXX"
              />
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="contact_email" lang="bn">
                ইমেইল
              </label>
              <IconInput
                icon={Mail}
                id="contact_email"
                type="email"
                value={settings.contact_email ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contact_email: e.target.value }))
                }
                placeholder="info@futureshop.com"
              />
            </div>
          </div>
          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="contact_address" lang="bn">
              ঠিকানা
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 flex items-start pl-3.5 pt-3">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                id="contact_address"
                value={settings.contact_address ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, contact_address: e.target.value }))
                }
                rows={2}
                placeholder="শেরপুর, বগুড়া, বাংলাদেশ"
                className="flex w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm resize-none min-h-[64px] placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/20 focus-visible:border-[#3b82f6] transition-all duration-200"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="h-11 min-w-[160px] rounded-lg bg-gradient-to-r from-[#f47920] to-[#fb923c] text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:from-[#e56910] hover:to-[#f47920] active:scale-[0.98]"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════ CARD 3: Banner List ═══════════ */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <SectionHeader
          icon={Globe}
          title="ব্যানার তালিকা"
          description="হোমপেইজের ব্যানার ছবি পরিচালনা করুন"
          accentColor="#8b5cf6"
          badge={
            banners.length > 0 ? (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[11px] font-semibold">
                {banners.length}টি
              </Badge>
            ) : null
          }
        />
        <div className="p-6">
          {banners.length === 0 ? (
            <EmptyState
              icon={<ImageOff className="h-7 w-7" />}
              title="কোনো ব্যানার নেই"
              description="নিচের ফর্ম থেকে নতুন ব্যানার যোগ করুন।"
            />
          ) : (
            <div className="grid gap-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all duration-200 hover:bg-white hover:shadow-sm hover:border-gray-200"
                >
                  {banner.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="h-14 w-24 flex-shrink-0 rounded-lg object-cover border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="h-14 w-24 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center">
                      <ImageOff className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{banner.title}</p>
                    {banner.link_url && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        🔗 {banner.link_url}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={
                      banner.is_active
                        ? "flex-shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 font-medium"
                        : "flex-shrink-0 bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-100 font-medium"
                    }
                  >
                    <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${banner.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {banner.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </Badge>
                  <Button
                    onClick={() => deleteBanner(banner.id)}
                    variant="ghost"
                    className="h-9 w-9 flex-shrink-0 p-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label={`Delete ${banner.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ CARD 4: Add New Banner ═══════════ */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <SectionHeader
          icon={ImagePlus}
          title="নতুন ব্যানার যোগ করুন"
          description="হোমপেইজে নতুন ব্যানার ছবি যোগ করুন"
          accentColor="#10b981"
        />
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="banner_title" lang="bn">
                শিরোনাম <span className="text-red-500">*</span>
              </label>
              <IconInput
                icon={Type}
                id="banner_title"
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="গ্রীষ্মকালীন অফার"
              />
            </div>
            {/* Link */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="banner_link" lang="bn">
                লিংক URL (ঐচ্ছিক)
              </label>
              <IconInput
                icon={Globe}
                id="banner_link"
                value={bLink}
                onChange={(e) => setBLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="banner_file" lang="bn">
              ছবি <span className="text-red-500">*</span>
            </label>
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/30"
              onClick={() => fileInputRef.current?.click()}
            >
              {bPreviewUrl ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bPreviewUrl}
                    alt="Preview"
                    className="mx-auto h-28 w-auto rounded-lg border border-gray-200 object-cover shadow-sm"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBFile(null);
                      setBPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600" lang="bn">ব্যানার ছবি আপলোড করুন</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG বা WebP · সর্বোচ্চ 5MB</p>
                </>
              )}
            </div>
            <input
              id="banner_file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onPickFile}
              className="hidden"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="bActive"
                checked={bActive}
                onChange={(e) => setBActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
            <label htmlFor="bActive" className="text-sm font-medium text-gray-700 cursor-pointer" lang="bn">
              সঙ্গে সঙ্গে সক্রিয় করুন
            </label>
          </div>

          {/* Add Banner Button */}
          <div className="flex justify-end">
            <Button
              onClick={addBanner}
              disabled={savingBanner || !bTitle.trim() || !bFile}
              className="h-11 min-w-[160px] rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {savingBanner ? "যোগ হচ্ছে..." : "ব্যানার যোগ করুন"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
