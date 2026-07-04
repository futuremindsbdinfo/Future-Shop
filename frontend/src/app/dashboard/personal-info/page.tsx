"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronDown,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { Address, User } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function PersonalInfoPage() {
  const { hydrated, user, isAuthenticated } = useDashboardAuth();
  const setUser = useAuthStore((s) => s.setUser);

  // --- Account details ---------------------------------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // --- Change password -----------------------------------------------------
  const [pwd, setPwd] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [savingPwd, setSavingPwd] = useState(false);

  // --- Address Book (collapsible section — was its own page) ---------------
  const [addressOpen, setAddressOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

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

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email ?? "");
    }
  }, [user]);

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      // AddressController::index returns { data: Address[] } (not paginated)
      const res = await api.get<{ data: Address[] }>("/addresses");
      setAddresses(res.data.data);
    } catch {
      /* 401 handled by axios interceptor */
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated) loadAddresses();
  }, [hydrated, isAuthenticated, loadAddresses]);

  if (!hydrated || !user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put<{ user: User }>("/auth/profile", {
        name,
        email: email.trim() || undefined,
      });
      setUser(res.data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Update failed"));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await api.put("/auth/password", pwd);
      setPwd({ current_password: "", password: "", password_confirmation: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Password change failed"));
    } finally {
      setSavingPwd(false);
    }
  };

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

  const saveAddress = async (e: React.FormEvent) => {
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

  const setDefaultAddress = async (a: Address) => {
    // Optimistic UI: flip flags locally, then reconcile with server.
    setAddresses((prev) =>
      prev.map((x) => ({ ...x, is_default: x.id === a.id })),
    );
    try {
      await api.patch<Address>(`/addresses/${a.id}/default`);
      // Re-load to confirm server state (covers any race).
      loadAddresses();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not set default"));
      loadAddresses(); // revert by reloading truth
    }
  };

  const confirmDeleteAddress = async () => {
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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Personal Info</h1>

      {/* Personal info card */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                className="h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-phone">Phone (not editable)</Label>
              <Input
                id="p-phone"
                className="h-11"
                value={user.phone ?? ""}
                readOnly
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                className="h-11"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={savingProfile}
              className="h-11 w-full bg-[#f47920] hover:bg-[#e56910] sm:w-auto"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cur-pwd">Current password</Label>
              <Input
                id="cur-pwd"
                className="h-11"
                type="password"
                value={pwd.current_password}
                onChange={(e) =>
                  setPwd({ ...pwd, current_password: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-pwd">New password</Label>
              <Input
                id="new-pwd"
                className="h-11"
                type="password"
                value={pwd.password}
                onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conf-pwd">Confirm new password</Label>
              <Input
                id="conf-pwd"
                className="h-11"
                type="password"
                value={pwd.password_confirmation}
                onChange={(e) =>
                  setPwd({ ...pwd, password_confirmation: e.target.value })
                }
                required
              />
            </div>
            <Button
              type="submit"
              disabled={savingPwd}
              className="h-11 w-full bg-[#f47920] hover:bg-[#e56910] sm:w-auto"
            >
              {savingPwd ? "Saving..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Address Book — collapsible section (was its own /dashboard/address-book
          page). Custom disclosure (no accordion library): a toggle header button
          + conditional CardContent, mirroring the pattern used in the admin
          sidebar (admin/layout.tsx RightPanel's expandedGroups). */}
      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <button
          type="button"
          onClick={() => setAddressOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 p-6 text-left"
          aria-expanded={addressOpen}
        >
          <span className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-4 w-4 text-[#f47920]" />
            Address Book
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              addressOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {addressOpen && (
          <CardContent className="space-y-4 border-t pt-4">
            <div className="flex justify-end">
              <Button
                onClick={openCreate}
                className="h-11 min-w-[44px] bg-[#f47920] hover:bg-[#e56910]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </div>

            {loadingAddresses ? (
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
                            onClick={() => setDefaultAddress(a)}
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
          </CardContent>
        )}
      </Card>

      {/* Create / Edit Address Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveAddress} className="space-y-3 py-2">
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

      {/* Delete Address Confirm */}
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
              onClick={confirmDeleteAddress}
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
