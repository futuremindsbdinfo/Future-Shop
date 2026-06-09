"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import type { PaginatedResponse, Product, PromotionRule } from "@/types";

export default function AdminPromotionsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<PaginatedResponse<PromotionRule> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/fuminds");
    }
  }, [hydrated, isAuthenticated, user, router]);

  // Load published products for the dropdowns (used by both create and edit forms).
  useEffect(() => {
    if (!hydrated || !isAuthenticated || user?.role !== "admin") return;
    api
      .get<PaginatedResponse<Product>>("/admin/products?per_page=100&status=published")
      .then((r) => setProducts(r.data.data))
      .catch(() => {});
  }, [hydrated, isAuthenticated, user]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<PromotionRule>>(
        `/admin/promotions?page=${page}&per_page=15`,
      );
      setData(res.data);
    } catch {
      toast.error("Failed to load promotion rules");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (hydrated && isAuthenticated && user?.role === "admin") load();
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
      toast.success(rule.is_active ? "Deactivated" : "Activated");
      load();
    } catch {
      toast.error("Toggle failed");
    }
  };

  const save = async () => {
    if (!fName.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if (!fTriggerProductId || !fFreeProductId) {
      toast.error("Trigger and free product are required");
      return;
    }
    if (fTriggerProductId === fFreeProductId) {
      toast.error("Trigger and free product must be different");
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
        toast.success("Promotion updated");
      } else {
        await api.post("/admin/promotions", body);
        toast.success("Promotion created");
      }
      setDialogOpen(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const errs = err?.response?.data?.errors;
      const msg = err?.response?.data?.message ?? "Save failed";
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
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (!hydrated || !isAuthenticated || user?.role !== "admin") {
    return <LoadingSpinner fullHeight />;
  }

  const sameProductSelected =
    !!fTriggerProductId && fTriggerProductId === fFreeProductId;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promotions (Buy X Get Y)</h1>
        <Button
          onClick={openCreate}
          className="h-11 min-w-[44px] bg-[#f47920] hover:bg-[#e56910]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Trigger Product</TableHead>
                <TableHead>Buy Qty</TableHead>
                <TableHead>Free Product</TableHead>
                <TableHead>Free Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No promotion rules yet.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell className="text-sm">
                      {rule.trigger_product?.name ?? `#${rule.trigger_product_id}`}
                    </TableCell>
                    <TableCell>{rule.trigger_quantity}</TableCell>
                    <TableCell className="text-sm">
                      {rule.free_product?.name ?? `#${rule.free_product_id}`}
                    </TableCell>
                    <TableCell>{rule.free_quantity}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleActive(rule)}
                        aria-label="Toggle active"
                        className="cursor-pointer"
                      >
                        <Badge
                          className={
                            rule.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }
                        >
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => openEdit(rule)}
                          className="h-10 w-10 p-0"
                          variant="ghost"
                          aria-label={`Edit ${rule.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(rule)}
                          className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                          variant="ghost"
                          aria-label={`Delete ${rule.name}`}
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
        </CardContent>
      </Card>

      {data && data.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            variant="outline"
            className="h-10 px-4"
          >
            Previous
          </Button>
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            {page} / {data.last_page}
          </span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === data.last_page}
            variant="outline"
            className="h-10 px-4"
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Promotion Rule" : "Create Promotion Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Rule Name <span className="text-red-500">*</span>
              </label>
              <input
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="e.g. Buy Harpic Get Bulti Free"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">
                  Trigger Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={fTriggerProductId}
                  onChange={(e) => setFTriggerProductId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Buy Qty</label>
                <input
                  type="number"
                  min={1}
                  value={fTriggerQty}
                  onChange={(e) => setFTriggerQty(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">
                  Free Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={fFreeProductId}
                  onChange={(e) => setFFreeProductId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Free Qty</label>
                <input
                  type="number"
                  min={1}
                  value={fFreeQty}
                  onChange={(e) => setFFreeQty(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {sameProductSelected && (
              <p className="text-xs text-red-500">
                Trigger and free product must be different.
              </p>
            )}

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={fIsActive}
                onChange={(e) => setFIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={() => setDialogOpen(false)} variant="ghost" className="h-11" disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={save}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
              disabled={saving || sameProductSelected}
            >
              {saving ? "Saving..." : editing ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Rule?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            Delete <strong>{deleteTarget?.name}</strong>? Past orders that used this
            rule are unaffected.
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setDeleteTarget(null)} variant="ghost" className="h-11" disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="h-11 bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
