"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  ExternalLink,
  ShieldCheck,
  Truck,
  Sparkles,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { FALLBACK_SETTINGS } from "@/lib/settings";
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
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "banners">("general");

  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Future Shop",
    site_tagline: FALLBACK_SETTINGS.site_tagline ?? "",
    contact_phone: FALLBACK_SETTINGS.contact_phone ?? "",
    contact_email: FALLBACK_SETTINGS.contact_email ?? "",
    contact_address: FALLBACK_SETTINGS.contact_address ?? "",
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
          site_name: d.site_name || FALLBACK_SETTINGS.site_name,
          site_tagline: d.site_tagline || FALLBACK_SETTINGS.site_tagline,
          contact_phone: d.contact_phone || FALLBACK_SETTINGS.contact_phone || "",
          contact_email: d.contact_email || FALLBACK_SETTINGS.contact_email || "",
          contact_address: d.contact_address || FALLBACK_SETTINGS.contact_address || "",
          site_logo: d.site_logo ?? "",
        });
        if (d.site_logo) setLogoPreview(d.site_logo);
      }),
      api.get<{ data: Banner[] }>("/admin/banners").then((r) => setBanners(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

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
      toast.success("সেটিংস সফলভাবে সংরক্ষিত হয়েছে ✓");
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
      toast.error("অনুগ্রহ করে ব্যানারের শিরোনাম ও ছবি দিন");
      return;
    }
    if (bFile.size > MAX_BYTES) {
      toast.error("ছবি সর্বোচ্চ ৫MB হতে হবে");
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
      toast.success("নতুন ব্যানার যুক্ত হয়েছে ✓");
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
      toast.error("ব্যানার মোছা যায়নি");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      
      {/* Header & Live Store Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              সাইট সেটিংস (Store Settings)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              গ্লোবাল কনফিগারেশন
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            শপ প্রোফাইল, লোগো, হেল্পলাইন, অফিসের ঠিকানা ও হোমপেইজ ব্যানার স্লাইডার
          </p>
        </div>

        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl border-orange-200 text-[#f47920] hover:bg-orange-50 text-xs font-bold shadow-2xs self-start sm:self-auto"
          nativeButton={false}
          render={<Link href="/" target="_blank" />}
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          <span>লাইভ শপ দেখুন</span>
        </Button>
      </div>

      {/* Settings Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: "general", label: "শপ প্রোফাইল ও লোগো", icon: Store },
            { id: "contact", label: "যোগাযোগ ও ঠিকানা", icon: Phone },
            { id: "banners", label: `হোম ব্যানার (${banners.length}টি)`, icon: Layers },
          ] as const
        ).map((t) => {
          const isCurrent = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isCurrent
                  ? "bg-[#f47920] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General & Logo */}
      {activeTab === "general" && (
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white overflow-hidden">
          <div className="p-5 sm:p-6 space-y-6">
            
            {/* Site Name */}
            <div className="space-y-1.5">
              <Label htmlFor="site_name" className="text-xs font-bold text-gray-700" lang="bn">
                ওয়েবসাইটের নাম (Site Name) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="site_name"
                  value={settings.site_name ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, site_name: e.target.value }))}
                  placeholder="Future Shop"
                  className="h-10 pl-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Logo Upload & Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700" lang="bn">
                শপের অফিসিয়াল লোগো (Site Logo)
              </Label>
              
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {logoPreview && (
                  <div className="relative group">
                    <div className="h-20 w-36 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/30 p-2 flex items-center justify-center">
                      <img src={logoPreview} alt="Logo" className="object-contain h-full w-auto max-w-full" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition-transform hover:scale-105"
                      title="লোগো মুছে ফেলুন"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div
                  className={`flex-1 w-full cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 ${
                    logoDragOver
                      ? "border-[#f47920] bg-orange-50"
                      : "border-gray-200 bg-gray-50/60 hover:border-orange-300 hover:bg-orange-50/20"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
                  onDragLeave={() => setLogoDragOver(false)}
                  onDrop={handleLogoDrop}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-6 w-6 text-[#f47920] mb-1.5" />
                  <p className="text-xs font-bold text-gray-700" lang="bn">নতুন লোগো আপলোড করতে ক্লিক বা ড্রপ করুন</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPEG বা WebP · সর্বোচ্চ ৫MB</p>
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
              <Label htmlFor="site_tagline" className="text-xs font-bold text-gray-700" lang="bn">
                শপের মূল স্লোগান / ট্যাগলাইন (বাংলা)
              </Label>
              <textarea
                id="site_tagline"
                value={settings.site_tagline ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, site_tagline: e.target.value }))}
                rows={2}
                placeholder="বাজারে নয়, বাজার আসবে আপনার ঘরে।"
                className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs resize-none outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all font-medium"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}</span>
              </Button>
            </div>

          </div>
        </Card>
      )}

      {/* TAB 2: Contact & Address */}
      {activeTab === "contact" && (
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white overflow-hidden">
          <div className="p-5 sm:p-6 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="contact_phone" className="text-xs font-bold text-gray-700" lang="bn">
                  অফিসিয়াল হেল্পলাইন / ফোন নম্বর
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={settings.contact_phone ?? ""}
                    onChange={(e) => setSettings((s) => ({ ...s, contact_phone: e.target.value }))}
                    placeholder="+880 1888-060447"
                    className="h-10 pl-10 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="contact_email" className="text-xs font-bold text-gray-700" lang="bn">
                  সাপোর্ট ইমেইল ঠিকানা
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email ?? ""}
                    onChange={(e) => setSettings((s) => ({ ...s, contact_email: e.target.value }))}
                    placeholder="info@futureshop.com.bd"
                    className="h-10 pl-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="contact_address" className="text-xs font-bold text-gray-700" lang="bn">
                প্রধান কার্যালয়ের সম্পূর্ণ ঠিকানা
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <textarea
                  id="contact_address"
                  value={settings.contact_address ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, contact_address: e.target.value }))}
                  rows={2}
                  placeholder="শেরপুর বাসস্ট্যান্ড সংলগ্ন, সোনালী ব্যাংকের পেছনে, শেরপুর-৫৮৪০, বগুড়া"
                  className="flex w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-xs resize-none outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "সংরক্ষণ হচ্ছে..." : "যোগাযোগের তথ্য সেভ করুন"}</span>
              </Button>
            </div>

          </div>
        </Card>
      )}

      {/* TAB 3: Banners & Sliders */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          
          {/* Add New Banner Form */}
          <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
                <ImagePlus className="w-4 h-4 text-[#f47920]" />
                <span>নতুন ব্যানার আপলোড করুন</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700" lang="bn">
                    ব্যানারের শিরোনাম <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    placeholder="যেমন: শেরপুর বগুড়ায় ফ্রি ডেলিভারি অফার"
                    className="h-10 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-700" lang="bn">লিংক URL (ঐচ্ছিক)</Label>
                  <Input
                    value={bLink}
                    onChange={(e) => setBLink(e.target.value)}
                    placeholder="যেমন: /products বা /categories"
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Banner File Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700" lang="bn">
                  ব্যানার ছবি <span className="text-red-500">*</span>
                </Label>
                
                <div
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 p-4 text-center hover:border-orange-300 hover:bg-orange-50/20 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {bPreviewUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={bPreviewUrl}
                        alt="Preview"
                        className="mx-auto h-28 w-auto rounded-xl border border-gray-200 object-cover shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBFile(null);
                          setBPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition-transform hover:scale-105"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-6 w-6 text-[#f47920] mb-1.5" />
                      <p className="text-xs font-bold text-gray-700" lang="bn">ব্যানার ছবি সিলেক্ট করতে ক্লিক করুন</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG বা WebP · প্রস্তাবিত সাইজ ১২০০x৪০০ পিক্সেল · সর্বোচ্চ ৫MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={onPickFile}
                  className="hidden"
                />
              </div>

              {/* Active Toggle & Add Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={bActive}
                    onChange={(e) => setBActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#f47920]"
                  />
                  <span>সরাসরি ওয়েবসাইটে সক্রিয় (Active) রাখুন</span>
                </label>

                <Button
                  onClick={addBanner}
                  disabled={savingBanner || !bTitle.trim() || !bFile}
                  className="h-10 px-5 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <ImagePlus className="h-4 w-4" />
                  <span>{savingBanner ? "যোগ হচ্ছে..." : "ব্যানার যোগ করুন"}</span>
                </Button>
              </div>

            </div>
          </Card>

          {/* Current Banners Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2" lang="bn">
              <Layers className="w-4 h-4 text-[#f47920]" />
              <span>বর্তমান ব্যানার তালিকা ({banners.length}টি)</span>
            </h2>

            {banners.length === 0 ? (
              <Card className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-xs text-muted-foreground" lang="bn">বর্তমানে কোনো ব্যানার নেই। উপরের ফর্ম থেকে যোগ করুন।</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className="rounded-3xl border border-gray-200 bg-white shadow-xs overflow-hidden group">
                    <div className="relative h-32 w-full bg-gray-100 overflow-hidden">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                          কোনো ছবি নেই
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <Badge className={`text-[10px] font-bold ${banner.is_active ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                          {banner.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-gray-900 text-xs truncate">{banner.title}</p>
                        {banner.link_url && (
                          <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                            🔗 {banner.link_url}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => deleteBanner(banner.id)}
                        variant="ghost"
                        className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-0 shrink-0"
                        title="ব্যানার মুছে ফেলুন"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
