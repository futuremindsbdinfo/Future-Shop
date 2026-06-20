"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

  // Auth gate (one-tick hydration wait, same as brands page).
  const [hydrated, setHydrated] = useState(false);

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.error("ক্যাটাগরির নাম দিন");
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
        toast.success("ক্যাটাগরি আপডেট হয়েছে");
      } else {
        await api.post("/admin/categories", payload);
        toast.success("ক্যাটাগরি যোগ হয়েছে");
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
      toast.success(`"${deleteTarget.name}" মুছে ফেলা হয়েছে`);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      // 409 guard (sub-categories / products) returns a clear message — surface it.
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  };

  // Look up a parent category's name for the table.
  const parentName = (parentIdValue: number | null): string => {
    if (!parentIdValue) return "—";
    return categories.find((c) => c.id === parentIdValue)?.name ?? "—";
  };

  // Parent options: every category except the one being edited (prevents the
  // obvious self-parent cycle; the backend also rejects descendant cycles).
  const parentOptions = categories.filter((c) => c.id !== editing?.id);

  if (!hydrated || !isAuthenticated || user?.role !== "admin") {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          onClick={openCreate}
          className="h-11 min-w-[44px] bg-[#f47920] hover:bg-[#e56910]"
        >
          <Plus className="mr-2 h-4 w-4" />
          নতুন ক্যাটাগরি
        </Button>
      </div>

      {/* Table card */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>আইকন</TableHead>
                  <TableHead>নাম</TableHead>
                  <TableHead>প্যারেন্ট</TableHead>
                  <TableHead>পণ্য</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      এখনো কোনো ক্যাটাগরি নেই। প্রথমটি যোগ করুন।
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="text-xl">{category.icon ?? "—"}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {parentName(category.parent_id)}
                      </TableCell>
                      <TableCell>{category.products_count ?? 0}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            category.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }
                        >
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => openEdit(category)}
                            className="h-10 w-10 p-0"
                            variant="ghost"
                            aria-label={`Edit ${category.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteTarget(category)}
                            className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                            variant="ghost"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">
                নাম <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="যেমন: ইলেকট্রনিক্স"
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Slug (auto-generated preview — backend derives it from name) */}
            <div className="space-y-1">
              <label className="text-sm font-medium">স্লাগ</label>
              <input
                value={slug}
                readOnly
                disabled
                placeholder="নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হবে"
                className="h-11 w-full rounded-md border border-input bg-muted px-3 font-mono text-sm text-muted-foreground outline-none"
              />
              <p className="text-xs text-muted-foreground">
                নাম থেকে স্বয়ংক্রিয়ভাবে তৈরি হয়।
              </p>
            </div>

            {/* Parent */}
            <div className="space-y-1">
              <label className="text-sm font-medium">প্যারেন্ট ক্যাটাগরি</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— কোনোটি নয় (টপ-লেভেল) —</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div className="space-y-1">
              <label className="text-sm font-medium">আইকন (ইমোজি)</label>
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="যেমন: 🛒"
                maxLength={16}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Sort order */}
            <div className="space-y-1">
              <label className="text-sm font-medium">ক্রম (sort order)</label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                সক্রিয়
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="ghost"
              className="h-11"
              disabled={saving}
            >
              বাতিল
            </Button>
            <Button
              onClick={save}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ক্যাটাগরি মুছবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            <strong>{deleteTarget?.name}</strong> মুছে ফেলবেন? সাব-ক্যাটাগরি বা পণ্য
            থাকলে মুছে ফেলা যাবে না।
          </p>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDeleteTarget(null)}
              variant="ghost"
              className="h-11"
              disabled={deleting}
            >
              বাতিল
            </Button>
            <Button
              onClick={confirmDelete}
              className="h-11 bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "মুছছে..." : "মুছুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
