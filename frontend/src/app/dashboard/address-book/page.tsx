"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import type { Address } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function AddressBookPage() {
  const { hydrated, isAuthenticated } = useDashboardAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  const [fLabel, setFLabel] = useState("");
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fDivision, setFDivision] = useState("");
  const [fDistrict, setFDistrict] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // AddressController::index returns { data: Address[] } (not paginated)
      const res = await api.get<{ data: Address[] }>("/addresses");
      setAddresses(res.data.data);
    } catch {
      /* 401 handled by axios interceptor */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated) load();
  }, [hydrated, isAuthenticated, load]);

  const openCreate = () => {
    setEditTarget(null);
    setFLabel("");
    setFName("");
    setFPhone("");
    setFAddress("");
    setFDivision("");
    setFDistrict("");
    setFormOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditTarget(a);
    setFLabel(a.label ?? "");
    setFName(a.recipient_name);
    setFPhone(a.phone);
    setFAddress(a.address);
    setFDivision(a.division ?? "");
    setFDistrict(a.district ?? "");
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim() || !fPhone.trim() || !fAddress.trim()) {
      toast.error("Recipient, phone, and address are required");
      return;
    }
    setSaving(true);
    const payload = {
      label: fLabel.trim() || null,
      recipient_name: fName.trim(),
      phone: fPhone.trim(),
      address: fAddress.trim(),
      division: fDivision.trim() || null,
      district: fDistrict.trim() || null,
    };
    try {
      if (editTarget) {
        const res = await api.put<Address>(`/addresses/${editTarget.id}`, payload);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editTarget.id ? res.data : a)),
        );
        toast.success("Address updated");
      } else {
        const res = await api.post<{ data: Address }>("/addresses", payload);
        setAddresses((prev) => [res.data.data, ...prev]);
        toast.success("Address added");
      }
      setFormOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (a: Address) => {
    // Optimistic UI: flip flags locally, then reconcile with server.
    setAddresses((prev) =>
      prev.map((x) => ({ ...x, is_default: x.id === a.id })),
    );
    try {
      await api.patch<Address>(`/addresses/${a.id}/default`);
      // Re-load to confirm server state (covers any race).
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not set default"));
      load(); // revert by reloading truth
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/addresses/${deleteTarget.id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success("Address deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Delete failed"));
    } finally {
      setDeleting(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Address Book</h1>
        <Button
          onClick={openCreate}
          className="h-11 min-w-[44px] bg-[#f47920] hover:bg-[#e56910]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-7 w-7" />}
          title="No saved addresses"
          description="Add an address to speed up future checkouts."
          action={
            <Button
              onClick={openCreate}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <Card
              key={a.id}
              className="rounded-xl border border-[#f1f5f9] shadow-sm"
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{a.recipient_name}</p>
                  <span className="text-sm text-muted-foreground">
                    · {a.phone}
                  </span>
                  {a.is_default && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Default
                    </Badge>
                  )}
                  {a.label && (
                    <Badge variant="outline" className="text-xs">
                      {a.label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {a.address}
                  {a.district ? `, ${a.district}` : ""}
                  {a.division ? `, ${a.division}` : ""}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {!a.is_default && (
                    <Button
                      variant="outline"
                      className="h-11 border-[#f47920] text-[#f47920] hover:bg-orange-50 hover:text-[#e56910]"
                      onClick={() => setDefault(a)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="h-11 min-w-[44px]"
                    onClick={() => openEdit(a)}
                    aria-label={`Edit address ${a.recipient_name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 min-w-[44px] text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleteTarget(a)}
                    aria-label={`Delete address ${a.recipient_name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="a-label">Label (optional)</Label>
              <Input
                id="a-label"
                className="h-11"
                placeholder="বাসা / অফিস / ..."
                value={fLabel}
                onChange={(e) => setFLabel(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="a-name">
                Recipient Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="a-name"
                className="h-11"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="a-phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="a-phone"
                className="h-11"
                type="tel"
                value={fPhone}
                onChange={(e) => setFPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="a-address">
                Address <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="a-address"
                rows={2}
                className="min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={fAddress}
                onChange={(e) => setFAddress(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="a-division">Division</Label>
                <Input
                  id="a-division"
                  className="h-11"
                  value={fDivision}
                  onChange={(e) => setFDivision(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="a-district">District</Label>
                <Input
                  id="a-district"
                  className="h-11"
                  value={fDistrict}
                  onChange={(e) => setFDistrict(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="h-11"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 bg-[#f47920] hover:bg-[#e56910]"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editTarget
                    ? "Update Address"
                    : "Save Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete address?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            This action can&apos;t be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="h-11"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="h-11 bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
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
