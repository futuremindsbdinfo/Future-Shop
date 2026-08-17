"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Pencil,
  Plus,
  Trash2,
  Percent,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Gift,
  Coins,
  ShieldCheck,
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
import { formatTaka } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { Coupon, PaginatedResponse } from "@/types";

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

export default function AdminCouponsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<PaginatedResponse<Coupon> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fCode, setFCode] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [fPercent, setFPercent] = useState("10");
  const [fMaxDiscount, setFMaxDiscount] = useState("");
  const [fUsageLimit, setFUsageLimit] = useState("");
  const [fFirstPurchaseOnly, setFFirstPurchaseOnly] = useState(true);
  const [fIsActive, setFIsActive] = useState(true);
  const [fWalletCredit, setFWalletCredit] = useState(true);
  const [fExpiresAt, setFExpiresAt] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
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

      const res = await api.get<PaginatedResponse<Coupon>>(`/admin/coupons?${params.toString()}`);
      setData(res.data);
    } catch {
      toast.error("কুপন তালিকা লোড করা যায়নি");
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
    setFCode("");
    setFDescription("");
    setFPercent("10");
    setFMaxDiscount("");
    setFUsageLimit("");
    setFFirstPurchaseOnly(true);
    setFIsActive(true);
    setFWalletCredit(true);
    setFExpiresAt("");
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setFCode(coupon.code);
    setFDescription(coupon.description ?? "");
    setFPercent(String(coupon.discount_percentage));
    setFMaxDiscount(
      coupon.max_discount_amount === null ? "" : String(coupon.max_discount_amount),
    );
    setFUsageLimit(coupon.usage_limit === null ? "" : String(coupon.usage_limit));
    setFFirstPurchaseOnly(coupon.is_first_purchase_only);
    setFIsActive(coupon.is_active);
    setFWalletCredit(coupon.wallet_credit_enabled);
    setFExpiresAt(coupon.expires_at ? coupon.expires_at.substring(0, 10) : "");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!fCode.trim()) {
      toast.error("অনুগ্রহ করে কুপন কোড লিখুন");
      return;
    }
    const percent = Number(fPercent);
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
      toast.error("ডিসকাউন্ট পার্সেন্ট ১ থেকে ১০০ এর মধ্যে হতে হবে");
      return;
    }
    const maxDiscount = fMaxDiscount.trim() ? Number(fMaxDiscount) : null;
    if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) {
      toast.error("সর্বোচ্চ ডিসকাউন্ট সীমা ০ বা তার বেশি হতে হবে");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: fCode.trim().toUpperCase(),
        description: fDescription.trim() || null,
        discount_percentage: percent,
        max_discount_amount: maxDiscount,
        usage_limit: fUsageLimit.trim() ? Number(fUsageLimit) : null,
        is_first_purchase_only: fFirstPurchaseOnly,
        is_active: fIsActive,
        wallet_credit_enabled: fWalletCredit,
        expires_at: fExpiresAt || null,
      };
      if (editing) {
        await api.patch(`/admin/coupons/${editing.id}`, body);
        toast.success("কুপন সফলভাবে আপডেট হয়েছে!");
      } else {
        await api.post("/admin/coupons", body);
        toast.success("নতুন কুপন কোড সফলভাবে তৈরি হয়েছে!");
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
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.code}" কুপন সফলভাবে মুছে ফেলা হয়েছে`);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "মুছে ফেলা যায়নি। ব্যবহৃত কুপন নিষ্ক্রিয় করে রাখুন।");
    } finally {
      setDeleting(false);
    }
  };

  if (!hydrated || !isAuthenticated || !(user?.role === "admin" || user?.role === "staff")) {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              কুপন ও ডিসকাউন্ট (Coupons & Offers)
            </h1>
            {data && (
              <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
                মোট {data.total}টি কুপন
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            প্রোমো কোড তৈরি, ডিসকাউন্ট পার্সেন্টেজ, ওয়ালেট ক্যাশব্যাক ও মেয়াদ নির্ধারণ
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন কুপন তৈরি করুন</span>
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
            placeholder="কুপন কোড দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all font-mono"
          />
        </div>
      </div>

      {/* Coupons Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[150px]">কুপন কোড ও বিবরণ</TableHead>
                <TableHead className="font-bold text-xs text-center">ছাড়ের হার (%)</TableHead>
                <TableHead className="font-bold text-xs">সর্বোচ্চ ছাড়</TableHead>
                <TableHead className="font-bold text-xs text-center">ব্যবহারের পরিসংখ্যান</TableHead>
                <TableHead className="font-bold text-xs text-center">ক্যাশব্যাক মোড</TableHead>
                <TableHead className="font-bold text-xs text-center">স্ট্যাটাস</TableHead>
                <TableHead className="font-bold text-xs">মেয়াদ শেষ</TableHead>
                <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো কুপন খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((coupon) => (
                  <TableRow key={coupon.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-sm text-[#f47920] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                            {coupon.code}
                          </span>
                          {coupon.is_first_purchase_only && (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                              ১ম অর্ডার
                            </Badge>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-gray-500 text-[11px] line-clamp-1 max-w-[220px]">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-bold text-gray-900 font-mono text-sm">
                      {coupon.discount_percentage}%
                    </TableCell>

                    <TableCell className="font-semibold text-gray-800 font-mono">
                      {coupon.max_discount_amount ? formatTaka(Number(coupon.max_discount_amount)) : "আনলিমিটেড"}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold">
                        {coupon.used_count} / {coupon.usage_limit === null ? "∞" : coupon.usage_limit} বার
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {coupon.wallet_credit_enabled ? (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                          ওয়ালেট ক্যাশব্যাক
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                          তাৎক্ষণিক ছাড়
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[10px] font-bold ${
                          coupon.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {coupon.is_active ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px]">
                      {coupon.expires_at ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{new Date(coupon.expires_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </span>
                      ) : (
                        "আজীবন বৈধ"
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => openEdit(coupon)}
                          className="h-8 w-8 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50 p-0"
                          variant="ghost"
                          title="এডিট করুন"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(coupon)}
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
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total}টি কুপন)
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
              {editing ? "কুপন কোড সম্পাদনা করুন" : "নতুন কুপন কোড তৈরি করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                কুপন কোড <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fCode}
                onChange={(e) =>
                  setFCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
                }
                placeholder="যেমন: WELCOME10, EID2026"
                maxLength={30}
                className="h-10 rounded-xl font-mono text-xs uppercase bg-gray-50/50"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                শুধুমাত্র বড় হাতের ইংরেজি অক্ষর, সংখ্যা এবং ড্যাশ/আন্ডারস্কোর গ্রহণযোগ্য।
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">সংক্ষিপ্ত বিবরণ</Label>
              <textarea
                value={fDescription}
                onChange={(e) => setFDescription(e.target.value)}
                rows={2}
                placeholder="যেমন: প্রথম অর্ডারে ১০% বিশেষ ওয়ালেট ক্যাশব্যাক অফার..."
                className="flex w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Percentage & Max Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">
                  ছাড়ের পরিমাণ (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={fPercent}
                  onChange={(e) => setFPercent(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">সর্বোচ্চ ছাড় সীমা (৳)</Label>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  value={fMaxDiscount}
                  onChange={(e) => setFMaxDiscount(e.target.value)}
                  placeholder="যেমন: 200 (ফাঁকা = আনলিমিটেড)"
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Usage Limit & Expiry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">ব্যবহারের মোট লিমিট</Label>
                <Input
                  type="number"
                  min={1}
                  value={fUsageLimit}
                  onChange={(e) => setFUsageLimit(e.target.value)}
                  placeholder="ফাঁকা = আনলিমিটেড"
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">মেয়াদ শেষ হওয়ার তারিখ</Label>
                <Input
                  type="date"
                  value={fExpiresAt}
                  onChange={(e) => setFExpiresAt(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fFirstPurchaseOnly}
                  onChange={(e) => setFFirstPurchaseOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                />
                <span className="font-bold text-gray-800" lang="bn">
                  শুধুমাত্র প্রথম অর্ডারে প্রযোজ্য (First Purchase Only)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fWalletCredit}
                  onChange={(e) => setFWalletCredit(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                />
                <span className="font-bold text-gray-800" lang="bn">
                  ডেলিভারির পর গ্রাহকের ওয়ালেটে ক্যাশব্যাক জমা হবে
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fIsActive}
                  onChange={(e) => setFIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                />
                <span className="font-bold text-gray-800" lang="bn">
                  ওয়েবসাইটে অবিলম্বে সক্রিয় রাখুন (Active)
                </span>
              </label>
            </div>

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
              {saving ? "সংরক্ষণ হচ্ছে..." : editing ? "আপডেট করুন" : "কূপন তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">কুপন কোড মুছে ফেলবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-xs text-muted-foreground leading-relaxed" lang="bn">
            আপনি কি নিশ্চিত যে <strong>{deleteTarget?.code}</strong> মুছে ফেলতে চান? যদি এই কুপন ইতিমধ্যে কোনো অর্ডারে ব্যবহৃত হয়ে থাকে, তবে সার্ভার এটি ডিলিট করতে দেবে না — সেক্ষেত্রে এটি নিষ্ক্রিয় করে রাখতে পারেন।
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
