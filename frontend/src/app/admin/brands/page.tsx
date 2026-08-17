"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Tag,
  Pencil,
  Trash2,
  Plus,
  ImageOff,
  X,
  Link2,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Brand, PaginatedResponse } from "@/types";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function AdminBrandsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Auth gate
  const [hydrated, setHydrated] = useState(false);

  // Data
  const [data, setData] = useState<PaginatedResponse<Brand> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoMode, setLogoMode] = useState<"file" | "url">("file");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !(user?.role === "admin" || user?.role === "staff")) {
      router.replace("/fuminds");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "20");
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await api.get<PaginatedResponse<Brand>>(`/admin/brands?${params.toString()}`);
      setData(res.data);
    } catch {
      toast.error("ব্র্যান্ড তালিকা লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    if (hydrated && isAuthenticated && (user?.role === "admin" || user?.role === "staff")) {
      load();
    }
  }, [load, hydrated, isAuthenticated, user]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSlugManual(false);
    setDescription("");
    setIsActive(true);
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl("");
    setLogoMode("file");
    setDialogOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setSlugManual(true);
    setDescription(brand.description ?? "");
    setIsActive(brand.is_active);
    setLogoFile(null);
    setLogoPreview(brand.logo?.url ?? null);
    setLogoUrl(brand.logo?.url ?? "");
    setLogoMode(brand.logo?.url && !brand.logo?.path ? "url" : "file");
    setDialogOpen(true);
  };

  const onNameChange = (val: string) => {
    setName(val);
    if (!slugManual) setSlug(slugify(val));
  };

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("শুধুমাত্র JPG, PNG বা WebP ছবি গ্রহণযোগ্য");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির আকার সর্বোচ্চ ৫MB হতে পারে");
      e.target.value = "";
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("অনুগ্রহ করে ব্র্যান্ডের নাম লিখুন");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (slug.trim()) fd.append("slug", slug.trim());
      if (description.trim()) fd.append("description", description.trim());
      fd.append("is_active", isActive ? "1" : "0");
      if (logoMode === "file" && logoFile) {
        fd.append("logo", logoFile);
      } else if (logoMode === "url" && logoUrl.trim()) {
        fd.append("logo_url", logoUrl.trim());
      }

      if (editing) {
        fd.append("_method", "PATCH");
        await api.post(`/admin/brands/${editing.id}`, fd);
        toast.success("ব্র্যান্ড তথ্য সফলভাবে আপডেট হয়েছে!");
      } else {
        await api.post("/admin/brands", fd);
        toast.success("নতুন ব্র্যান্ড সফলভাবে তৈরি হয়েছে!");
      }
      setDialogOpen(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const errs = err?.response?.data?.errors;
      const msg = err?.response?.data?.message ?? "সংরক্ষণ ব্যর্থ হয়েছে";
      toast.error(errs ? Object.values(errs).flat().join(" ") : msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/brands/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" ব্র্যান্ড সফলভাবে মুছে ফেলা হয়েছে`);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  };

  if (!hydrated || !isAuthenticated || !(user?.role === "admin" || user?.role === "staff")) {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              ব্র্যান্ড ব্যবস্থাপনা (Brand Catalog)
            </h1>
            {data && (
              <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
                মোট {data.total}টি ব্র্যান্ড
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            ওয়েবসাইটের সকল ব্র্যান্ড লোগো, তথ্য, অ্যাক্টিভ স্ট্যাটাস ও প্রোডাক্ট ম্যাপিং
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ব্র্যান্ড যোগ করুন</span>
        </Button>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ব্র্যান্ডের নাম বা স্লাগ দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="w-16 font-bold text-xs text-center">লোগো</TableHead>
                <TableHead className="font-bold text-xs min-w-[180px]">ব্র্যান্ডের নাম ও স্লাগ</TableHead>
                <TableHead className="font-bold text-xs min-w-[200px]">বিবরণ</TableHead>
                <TableHead className="font-bold text-xs text-center">মোট পণ্য</TableHead>
                <TableHead className="font-bold text-xs text-center">স্ট্যাটাস</TableHead>
                <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো ব্র্যান্ড খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((brand) => (
                  <TableRow key={brand.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell className="text-center">
                      <div className="relative h-10 w-10 mx-auto overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                        {brand.logo?.url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={brand.logo.url}
                            alt={brand.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Tag className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-gray-900">{brand.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">/{brand.slug}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-gray-600 line-clamp-1 max-w-[280px]">
                        {brand.description || <span className="text-muted-foreground">—</span>}
                      </p>
                    </TableCell>

                    <TableCell className="text-center font-bold text-gray-900">
                      <span className="bg-orange-50 text-[#f47920] px-2.5 py-0.5 rounded-md text-[11px]">
                        {brand.products_count ?? 0}টি
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[10px] font-bold ${
                          brand.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {brand.is_active ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => openEdit(brand)}
                          className="h-8 w-8 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50 p-0"
                          variant="ghost"
                          title="এডিট করুন"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(brand)}
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 p-0"
                          variant="ghost"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <span className="text-xs text-muted-foreground font-semibold" lang="bn">
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total}টি ব্র্যান্ড)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-bold"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>আগের পৃষ্ঠা</span>
            </Button>

            {getPageNumbers(data.current_page, data.last_page).map((item, idx) => {
              if (item === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground select-none">
                    ...
                  </span>
                );
              }
              const isCurrent = item === data.current_page;
              return (
                <Button
                  key={item}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`h-9 min-w-[36px] px-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#f47920] text-white hover:bg-[#d46212] shadow-xs"
                      : "text-gray-700 hover:text-[#f47920]"
                  }`}
                  onClick={() => {
                    if (item !== page) setPage(item as number);
                  }}
                >
                  {item}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-bold"
              disabled={page >= data.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              <span>পরের পৃষ্ঠা</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              {editing ? "ব্র্যান্ড তথ্য সম্পাদনা করুন" : "নতুন ব্র্যান্ড যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                ব্র্যান্ডের নাম <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="যেমন: Pran, Unilever, Radhuni"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">স্লাগ (URL Slug)</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে"
                className="h-10 rounded-xl text-xs font-mono bg-gray-50/50"
              />
              <p className="text-[10px] text-muted-foreground">
                ফাঁকা রাখলে নাম অনুযায়ী স্বয়ংক্রিয় স্লাগ তৈরি হবে।
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="ব্র্যান্ডের সংক্ষিপ্ত পরিচিতি বা বিবরণ লিখুন..."
                className="flex w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Logo Mode Toggle & Input */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <Label className="font-bold text-gray-700" lang="bn">ব্র্যান্ড লোগো</Label>
              
              <div className="flex rounded-xl border border-gray-200 overflow-hidden p-0.5 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setLogoMode("file")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    logoMode === "file"
                      ? "bg-[#f47920] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  ফাইল আপলোড
                </button>
                <button
                  type="button"
                  onClick={() => setLogoMode("url")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    logoMode === "url"
                      ? "bg-[#f47920] text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  ইমেজ URL
                </button>
              </div>

              {/* Logo Preview */}
              {(logoPreview || (logoMode === "url" && logoUrl.trim())) && (
                <div className="relative inline-block mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoMode === "url" && logoUrl.trim() ? logoUrl.trim() : (logoPreview ?? "")}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-2xl border-2 border-orange-200 object-contain p-1 bg-white shadow-2xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      setLogoUrl("");
                    }}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700"
                    aria-label="Remove logo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* File Mode */}
              {logoMode === "file" && (
                <div className="space-y-1">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onLogoChange}
                    className="h-10 rounded-xl text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    JPG, PNG বা WebP, সর্বোচ্চ ৫ MB
                  </p>
                </div>
              )}

              {/* URL Mode */}
              {logoMode === "url" && (
                <div className="space-y-1">
                  <Input
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setLogoPreview(e.target.value || null);
                    }}
                    placeholder="https://example.com/logo.png"
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    সরাসরি ইমেজ URL পেস্ট করুন (HTTPS)
                  </p>
                </div>
              )}
            </div>

            {/* Is Active */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
              />
              <span className="font-bold text-gray-800" lang="bn">
                ওয়েবসাইটে অবিলম্বে সক্রিয় রাখুন (Active)
              </span>
            </label>

          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={saving}
            >
              বাতিল
            </Button>
            <Button
              onClick={save}
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              disabled={saving}
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : editing ? "আপডেট করুন" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">ব্র্যান্ডটি মুছে ফেলবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-xs text-muted-foreground leading-relaxed" lang="bn">
            আপনি কি নিশ্চিত যে <strong>{deleteTarget?.name}</strong> মুছে ফেলতে চান? এই ব্র্যান্ডের অধীনে থাকা পণ্যগুলোর ব্র্যান্ড ফিল্ড মুছে যাবে, কিন্তু পণ্যগুলো ডিলিট হবে না।
          </p>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDeleteTarget(null)}
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={deleting}
            >
              বাতিল
            </Button>
            <Button
              onClick={confirmDelete}
              className="h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold"
              disabled={deleting}
            >
              {deleting ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
