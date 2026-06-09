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
import type { Coupon, PaginatedResponse } from "@/types";

export default function AdminCouponsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<PaginatedResponse<Coupon> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fCode, setFCode] = useState("");
  const [fDescription, setFDescription] = useState("");
  const [fPercent, setFPercent] = useState("10");
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
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/fuminds");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Coupon>>(
        `/admin/coupons?page=${page}&per_page=15`,
      );
      setData(res.data);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (hydrated && isAuthenticated && user?.role === "admin") load();
  }, [load, hydrated, isAuthenticated, user]);

  const openCreate = () => {
    setEditing(null);
    setFCode("");
    setFDescription("");
    setFPercent("10");
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
    setFUsageLimit(coupon.usage_limit === null ? "" : String(coupon.usage_limit));
    setFFirstPurchaseOnly(coupon.is_first_purchase_only);
    setFIsActive(coupon.is_active);
    setFWalletCredit(coupon.wallet_credit_enabled);
    // Trim to YYYY-MM-DD for date input
    setFExpiresAt(coupon.expires_at ? coupon.expires_at.substring(0, 10) : "");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!fCode.trim()) {
      toast.error("Code is required");
      return;
    }
    const percent = Number(fPercent);
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
      toast.error("Discount must be between 1 and 100");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: fCode.trim(),
        description: fDescription.trim() || null,
        discount_percentage: percent,
        usage_limit: fUsageLimit.trim() ? Number(fUsageLimit) : null,
        is_first_purchase_only: fFirstPurchaseOnly,
        is_active: fIsActive,
        wallet_credit_enabled: fWalletCredit,
        expires_at: fExpiresAt || null,
      };
      if (editing) {
        await api.patch(`/admin/coupons/${editing.id}`, body);
        toast.success("Coupon updated");
      } else {
        await api.post("/admin/coupons", body);
        toast.success("Coupon created");
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
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.code}" deleted`);
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

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button
          onClick={openCreate}
          className="h-11 min-w-[44px] bg-[#f47920] hover:bg-[#e56910]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>First Purchase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
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
                    No coupons yet. Create your first one.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                    <TableCell>{coupon.discount_percentage}%</TableCell>
                    <TableCell>
                      {coupon.used_count}
                      {coupon.usage_limit === null ? " / ∞" : ` / ${coupon.usage_limit}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          coupon.is_first_purchase_only
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                        }
                      >
                        {coupon.is_first_purchase_only ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          coupon.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                        }
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString("en-GB")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => openEdit(coupon)}
                          className="h-10 w-10 p-0"
                          variant="ghost"
                          aria-label={`Edit ${coupon.code}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setDeleteTarget(coupon)}
                          className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                          variant="ghost"
                          aria-label={`Delete ${coupon.code}`}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                value={fCode}
                onChange={(e) =>
                  setFCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
                }
                placeholder="WELCOME10"
                maxLength={50}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Uppercase letters, digits, underscores and hyphens only.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={fDescription}
                onChange={(e) => setFDescription(e.target.value)}
                rows={2}
                placeholder="Optional description"
                className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Discount % <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={fPercent}
                  onChange={(e) => setFPercent(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Usage Limit</label>
                <input
                  type="number"
                  min={1}
                  value={fUsageLimit}
                  onChange={(e) => setFUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">Leave blank for unlimited.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Expires At</label>
              <input
                type="date"
                value={fExpiresAt}
                onChange={(e) => setFExpiresAt(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Leave blank for no expiry.</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={fFirstPurchaseOnly}
                  onChange={(e) => setFFirstPurchaseOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm font-medium">First purchase only</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={fIsActive}
                  onChange={(e) => setFIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={fWalletCredit}
                  onChange={(e) => setFWalletCredit(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm font-medium">Credit cashback to wallet after delivery</span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={() => setDialogOpen(false)} variant="ghost" className="h-11" disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} className="h-11 bg-[#f47920] hover:bg-[#e56910]" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Coupon" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Coupon?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            Delete <strong>{deleteTarget?.code}</strong>? If it has been used,
            the server will block deletion — deactivate it instead.
          </p>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDeleteTarget(null)}
              variant="ghost"
              className="h-11"
              disabled={deleting}
            >
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
