"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Plus,
  FolderTree,
  Search,
  Package,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Category } from "@/types";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function AdminCategoriesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [hydrated, setHydrated] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [icon, setIcon] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/fuminds");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Category[] }>("/admin/categories");
      setCategories(res.data.data);
    } catch {
      toast.error("ক্যাটাগরি লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated && user?.role === "admin") load();
  }, [load, hydrated, isAuthenticated, user]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setParentId("");
    setIcon("");
    setIsActive(true);
    setSortOrder("0");
    setDialogOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setParentId(category.parent_id ? String(category.parent_id) : "");
    setIcon(category.icon ?? "");
    setIsActive(category.is_active);
    setSortOrder(String(category.sort_order));
    setDialogOpen(true);
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error("অনুগ্রহ করে ক্যাটাগরির নাম লিখুন");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        parent_id: parentId ? Number(parentId) : null,
        icon: icon.trim() || null,
        is_active: isActive,
        sort_order: Number(sortOrder) || 0,
      };

      if (editing) {
        await api.patch(`/admin/categories/${editing.id}`, payload);
        toast.success("ক্যাটাগরি সফলভাবে আপডেট হয়েছে!");
      } else {
        await api.post("/admin/categories", payload);
        toast.success("নতুন ক্যাটাগরি সফলভাবে তৈরি হয়েছে!");
      }
      setDialogOpen(false);
      load();
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { errors?: Record<string, string[]>; message?: string } };
      };
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
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে`);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "এই ক্যাটাগরিতে পণ্য বা সাব-ক্যাটাগরি থাকায় মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  };

  const parentName = (parentIdValue: number | null): string => {
    if (!parentIdValue) return "— (টপ-লেভেল)";
    return categories.find((c) => c.id === parentIdValue)?.name ?? "—";
  };

  const parentOptions = categories.filter((c) => c.id !== editing?.id);

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  if (!hydrated || !isAuthenticated || user?.role !== "admin") {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & New Category Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              ক্যাটাগরি ব্যবস্থাপনা (Categories)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              মোট {categories.length}টি ক্যাটাগরি
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            ওয়েবসাইটের প্রধান ক্যাটাগরি, সাব-ক্যাটাগরি ও প্রদর্শন আইকন নির্ধারণ করুন
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ক্যাটাগরি যোগ করুন</span>
        </Button>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্যাটাগরির নাম দিয়ে খুঁজুন..."
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
                <TableHead className="w-16 font-bold text-xs text-center">আইকন</TableHead>
                <TableHead className="font-bold text-xs">ক্যাটাগরির নাম ও স্লাগ</TableHead>
                <TableHead className="font-bold text-xs">প্যারেন্ট ক্যাটাগরি</TableHead>
                <TableHead className="font-bold text-xs text-center">মোট পণ্য</TableHead>
                <TableHead className="font-bold text-xs text-center">ক্রম (Order)</TableHead>
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
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো ক্যাটাগরি খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell className="text-center">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-base shadow-2xs">
                        {category.icon || "📁"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-gray-900">{category.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">/{category.slug}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-600 font-medium">
                      {category.parent_id ? (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[11px]">
                          <span>↳ {parentName(category.parent_id)}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">টপ-লেভেল</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-bold text-gray-900">
                      <span className="bg-orange-50 text-[#f47920] px-2 py-0.5 rounded-md text-[11px]">
                        {category.products_count ?? 0}টি
                      </span>
                    </TableCell>

                    <TableCell className="text-center font-mono text-gray-600">
                      {category.sort_order ?? 0}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[10px] font-bold ${
                          category.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {category.is_active ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => openEdit(category)}
                          className="h-8 w-8 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50 p-0"
                          variant="ghost"
                          title="এডিট করুন"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(category)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              {editing ? "ক্যাটাগরি সম্পাদনা করুন" : "নতুন ক্যাটাগরি তৈরি করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                ক্যাটাগরির নাম <span className="text-red-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="যেমন: ডেইরি ও ডিম"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">স্লাগ (URL Slug)</Label>
              <Input
                value={slug}
                readOnly
                disabled
                placeholder="নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে"
                className="h-10 rounded-xl text-xs font-mono bg-gray-50 text-muted-foreground"
              />
            </div>

            {/* Parent Category */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">প্যারেন্ট ক্যাটাগরি</Label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
              >
                <option value="">— কোনোটি নয় (টপ-লেভেল ক্যাটাগরি) —</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">আইকন (Emoji বা প্রতীক)</Label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="যেমন: 🥚 বা 🛒"
                maxLength={16}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">প্রদর্শন ক্রম (Sort Order)</Label>
              <Input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-10 rounded-xl text-xs font-mono"
              />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">ক্যাটাগরি মুছে ফেলবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-xs text-muted-foreground leading-relaxed" lang="bn">
            আপনি কি নিশ্চিত যে <strong>{deleteTarget?.name}</strong> মুছে ফেলতে চান? যদি এর অধীনে কোনো সাব-ক্যাটাগরি বা পণ্য থাকে, তবে এটি মুছে ফেলা যাবে না।
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
