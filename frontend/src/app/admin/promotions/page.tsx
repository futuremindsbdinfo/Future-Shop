"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  Pencil,
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Package,
  ArrowRight,
  AlertCircle,
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
import type { PaginatedResponse, Product, PromotionRule } from "@/types";

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

export default function AdminPromotionsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<PaginatedResponse<PromotionRule> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PromotionRule | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [fName, setFName] = useState("");
  const [fTriggerProductId, setFTriggerProductId] = useState("");
  const [fTriggerQty, setFTriggerQty] = useState("1");
  const [fFreeProductId, setFFreeProductId] = useState("");
  const [fFreeQty, setFFreeQty] = useState("1");
  const [fIsActive, setFIsActive] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<PromotionRule | null>(null);
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

  // Load published products for the dropdowns
  useEffect(() => {
    if (!hydrated || !isAuthenticated || !(user?.role === "admin" || user?.role === "staff")) return;
    api
      .get<PaginatedResponse<Product>>("/admin/products?per_page=150&status=published")
      .then((r) => setProducts(r.data.data))
      .catch(() => {});
  }, [hydrated, isAuthenticated, user]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "20");
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await api.get<PaginatedResponse<PromotionRule>>(
        `/admin/promotions?${params.toString()}`,
      );
      setData(res.data);
    } catch {
      toast.error("প্রমোশন অফার তালিকা লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    if (hydrated && isAuthenticated && (user?.role === "admin" || user?.role === "staff")) load();
  }, [load, hydrated, isAuthenticated, user]);

  const openCreate = () => {
    setEditing(null);
    setFName("");
    setFTriggerProductId("");
    setFTriggerQty("1");
    setFFreeProductId("");
    setFFreeQty("1");
    setFIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (rule: PromotionRule) => {
    setEditing(rule);
    setFName(rule.name);
    setFTriggerProductId(String(rule.trigger_product_id));
    setFTriggerQty(String(rule.trigger_quantity));
    setFFreeProductId(String(rule.free_product_id));
    setFFreeQty(String(rule.free_quantity));
    setFIsActive(rule.is_active);
    setDialogOpen(true);
  };

  const toggleActive = async (rule: PromotionRule) => {
    try {
      await api.patch(`/admin/promotions/${rule.id}`, { is_active: !rule.is_active });
      toast.success(rule.is_active ? "অফারটি নিষ্ক্রিয় করা হয়েছে" : "অফারটি সক্রিয় করা হয়েছে");
      load();
    } catch {
      toast.error("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  const save = async () => {
    if (!fName.trim()) {
      toast.error("অনুগ্রহ করে অফারের নাম লিখুন");
      return;
    }
    if (!fTriggerProductId || !fFreeProductId) {
      toast.error("মূল পণ্য ও ফ্রি পণ্য নির্বাচন আবশ্যক");
      return;
    }
    if (fTriggerProductId === fFreeProductId) {
      toast.error("মূল পণ্য এবং ফ্রি পণ্য অবশ্যই ভিন্ন হতে হবে");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: fName.trim(),
        trigger_product_id: Number(fTriggerProductId),
        trigger_quantity: Number(fTriggerQty) || 1,
        free_product_id: Number(fFreeProductId),
        free_quantity: Number(fFreeQty) || 1,
        is_active: fIsActive,
      };
      if (editing) {
        await api.patch(`/admin/promotions/${editing.id}`, body);
        toast.success("প্রমোশন রুল সফলভাবে আপডেট হয়েছে!");
      } else {
        await api.post("/admin/promotions", body);
        toast.success("নতুন প্রমোশন রুল সফলভাবে তৈরি হয়েছে!");
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
      await api.delete(`/admin/promotions/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" অফার সফলভাবে মুছে ফেলা হয়েছে`);
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

  const sameProductSelected =
    !!fTriggerProductId && fTriggerProductId === fFreeProductId;

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              প্রমোশন ও অফার রুলস (Buy X Get Y)
            </h1>
            {data && (
              <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
                মোট {data.total}টি অফার
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            নির্দিষ্ট পণ্য ক্রয়ে ফ্রি গিফট বা বাই ১ গেট ১ অফার কনফিগারেশন
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন অফার রুল যোগ করুন</span>
        </Button>
      </div>

      {/* Search Bar */}
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
            placeholder="অফারের নাম দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all"
          />
        </div>
      </div>

      {/* Promotions Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[180px]">অফারের নাম</TableHead>
                <TableHead className="font-bold text-xs min-w-[200px]">মূল কেনাকাটার পণ্য (Buy)</TableHead>
                <TableHead className="font-bold text-xs text-center">পরিমাণ</TableHead>
                <TableHead className="font-bold text-xs min-w-[200px]">ফ্রি গিফট পণ্য (Get Free)</TableHead>
                <TableHead className="font-bold text-xs text-center">ফ্রি সংখ্যা</TableHead>
                <TableHead className="font-bold text-xs text-center">স্ট্যাটাস</TableHead>
                <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো প্রমোশন রুল খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((rule) => (
                  <TableRow key={rule.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#f47920]">
                          <Gift className="h-4 w-4" />
                        </span>
                        <span className="font-bold text-gray-900">{rule.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-gray-800 line-clamp-1">
                        {rule.trigger_product?.name ?? `#${rule.trigger_product_id}`}
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-bold text-gray-900 font-mono">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px]">
                        {rule.trigger_quantity}টি
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                        <ArrowRight className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="line-clamp-1">
                          {rule.free_product?.name ?? `#${rule.free_product_id}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-bold font-mono">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-md text-[11px]">
                        {rule.free_quantity}টি ফ্রি
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => toggleActive(rule)}
                        className="cursor-pointer"
                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                      >
                        <Badge
                          className={`text-[10px] font-bold ${
                            rule.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {rule.is_active ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                        </Badge>
                      </button>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => openEdit(rule)}
                          className="h-8 w-8 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50 p-0"
                          variant="ghost"
                          title="এডিট করুন"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(rule)}
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
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total}টি অফার)
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
              {editing ? "প্রমোশন রুল সম্পাদনা করুন" : "নতুন প্রমোশন রুল তৈরি করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            {/* Rule Name */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                অফারের নাম <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="যেমন: ১টি হারপিক কিনলে ১টি বালতি ফ্রি"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            {/* Trigger Product */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">
                  মূল কেনাকাটার পণ্য (Buy) <span className="text-red-500">*</span>
                </Label>
                <select
                  value={fTriggerProductId}
                  onChange={(e) => setFTriggerProductId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f47920]"
                >
                  <option value="">পণ্য নির্বাচন করুন...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">পরিমাণ</Label>
                <Input
                  type="number"
                  min={1}
                  value={fTriggerQty}
                  onChange={(e) => setFTriggerQty(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Free Product */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">
                  ফ্রি গিফট পণ্য (Get Free) <span className="text-red-500">*</span>
                </Label>
                <select
                  value={fFreeProductId}
                  onChange={(e) => setFFreeProductId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f47920]"
                >
                  <option value="">পণ্য নির্বাচন করুন...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">ফ্রি সংখ্যা</Label>
                <Input
                  type="number"
                  min={1}
                  value={fFreeQty}
                  onChange={(e) => setFFreeQty(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {sameProductSelected && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 font-bold text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>মূল কেনাকাটার পণ্য এবং ফ্রি পণ্য ভিন্ন হতে হবে!</span>
              </div>
            )}

            {/* Is Active */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-1 border-t border-gray-100">
              <input
                type="checkbox"
                checked={fIsActive}
                onChange={(e) => setFIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
              />
              <span className="font-bold text-gray-800" lang="bn">
                ওয়েবসাইটে অবিলম্বে অফারটি সক্রিয় রাখুন (Active)
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
              disabled={saving || sameProductSelected}
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : editing ? "আপডেট করুন" : "অফার তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">অফারটি মুছে ফেলবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-xs text-muted-foreground leading-relaxed" lang="bn">
            আপনি কি নিশ্চিত যে <strong>{deleteTarget?.name}</strong> অফারটি মুছে ফেলতে চান? পূর্বে সম্পন্ন হওয়া অর্ডারে এর কোনো প্রভাব পড়বে না।
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
