"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { PaginatedResponse, Vendor } from "@/types";

const TK = "৳";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

function VendorRow({
  vendor,
  onSaved,
  onEdit,
}: {
  vendor: Vendor;
  onSaved: () => void;
  onEdit: (v: Vendor) => void;
}) {
  const [commission, setCommission] = useState(String(vendor.commission_rate));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/vendors/${vendor.id}`, { commission_rate: Number(commission) });
      toast.success("কমিশন আপডেট হয়েছে");
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error, "আপডেট ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{vendor.shop_name}</TableCell>
      <TableCell>{vendor.user?.name ?? "—"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="0"
            max="100"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            className="h-11 w-20"
          />
          <Button variant="outline" className="h-11" disabled={saving} onClick={save}>Save</Button>
        </div>
      </TableCell>
      <TableCell>{TK}{(vendor.net_earnings ?? 0).toLocaleString("en-US")}</TableCell>
      <TableCell><Badge variant="outline">{vendor.status}</Badge></TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          className="h-10 w-10 p-0"
          onClick={() => onEdit(vendor)}
          aria-label={`Edit ${vendor.shop_name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Add Vendor form (dealer details — a user account is auto-created server-side).
  const [shopName, setShopName] = useState("");
  const [proprietorName, setProprietorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [srName, setSrName] = useState("");
  const [srMobile, setSrMobile] = useState("");
  const [commission, setCommission] = useState("10");
  const [status, setStatus] = useState("approved");
  const [creating, setCreating] = useState(false);

  // Edit dialog (Batch E-2).
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editShopName, setEditShopName] = useState("");
  const [editProprietorName, setEditProprietorName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDivision, setEditDivision] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editSrName, setEditSrName] = useState("");
  const [editSrMobile, setEditSrMobile] = useState("");
  const [editCommission, setEditCommission] = useState("10");
  const [editStatus, setEditStatus] = useState("approved");
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<PaginatedResponse<Vendor>>("/admin/vendors?per_page=50")
      .then((r) => setVendors(r.data.data))
      .catch(() => toast.error("Failed to load vendors"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditShopName(vendor.shop_name);
    setEditProprietorName(vendor.proprietor_name ?? "");
    setEditPhone(vendor.phone ?? "");
    setEditAddress(vendor.address ?? "");
    setEditDivision(vendor.division ?? "");
    setEditDistrict(vendor.district ?? "");
    setEditSrName(vendor.sr_name ?? "");
    setEditSrMobile(vendor.sr_mobile ?? "");
    setEditCommission(String(vendor.commission_rate));
    setEditStatus(vendor.status);
  };

  const saveEdit = async () => {
    if (!editingVendor) return;
    if (!editShopName.trim()) {
      toast.error("দোকানের নাম দিন");
      return;
    }
    setEditSaving(true);
    try {
      // Updates the vendor record's dealer fields. Note: editing the vendor's
      // phone here does NOT change the linked user account's login phone.
      await api.patch(`/admin/vendors/${editingVendor.id}`, {
        shop_name: editShopName.trim(),
        proprietor_name: editProprietorName.trim() || null,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
        division: editDivision.trim() || null,
        district: editDistrict.trim() || null,
        sr_name: editSrName.trim() || null,
        sr_mobile: editSrMobile.trim() || null,
        commission_rate: Number(editCommission),
        status: editStatus,
      });
      toast.success("বিক্রেতা আপডেট হয়েছে");
      setEditingVendor(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "আপডেট ব্যর্থ হয়েছে"));
    } finally {
      setEditSaving(false);
    }
  };

  const createVendor = async () => {
    if (!shopName.trim() || !phone.trim()) {
      toast.error("দোকানের নাম ও ফোন দিন");
      return;
    }
    setCreating(true);
    try {
      await api.post("/admin/vendors", {
        shop_name: shopName.trim(),
        proprietor_name: proprietorName.trim() || null,
        phone: phone.trim(),
        email: email.trim() || null,
        address: address.trim() || null,
        division: division.trim() || null,
        district: district.trim() || null,
        sr_name: srName.trim() || null,
        sr_mobile: srMobile.trim() || null,
        commission_rate: Number(commission),
        status,
      });
      toast.success("বিক্রেতা যোগ হয়েছে");
      setOpen(false);
      // Reset the form.
      setShopName("");
      setProprietorName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setDivision("");
      setDistrict("");
      setSrName("");
      setSrMobile("");
      load();
    } catch (error) {
      // Surface duplicate phone/email (422) with a clear Bengali message.
      const resp = (
        error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }
      ).response;
      const errs = resp?.data?.errors;
      if (errs?.phone) {
        toast.error("এই ফোন নম্বরে already একজন user আছে।");
      } else if (errs?.email) {
        toast.error("এই ইমেইলে already একজন user আছে।");
      } else {
        toast.error(getErrorMessage(error, "বিক্রেতা যোগ ব্যর্থ হয়েছে"));
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Button className="h-11 bg-[#f47920] hover:bg-[#e56910]" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : vendors.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No vendors yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Commission %</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <VendorRow key={vendor.id} vendor={vendor} onSaved={load} onEdit={openEdit} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন বিক্রেতা (Vendor)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop_name">দোকান/ডিলার নাম <span className="text-red-500">*</span></Label>
              <Input id="shop_name" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="যেমন: Abdullah Traders" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proprietor_name">প্রোপাইটর (Proprietor)</Label>
              <Input id="proprietor_name" value={proprietorName} onChange={(e) => setProprietorName(e.target.value)} placeholder="যেমন: Rezaul Karim" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">ফোন <span className="text-red-500">*</span></Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                <p className="text-xs text-muted-foreground">ডিলার মোবাইল — এটা দিয়ে user account auto-তৈরি হবে।</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল (optional)</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">ঠিকানা</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="division">বিভাগ (Division)</Label>
                <Input id="division" value={division} onChange={(e) => setDivision(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">জেলা (District)</Label>
                <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sr_name">SR নাম</Label>
                <Input id="sr_name" value={srName} onChange={(e) => setSrName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sr_mobile">SR মোবাইল</Label>
                <Input id="sr_mobile" value={srMobile} onChange={(e) => setSrMobile(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="commission">কমিশন % <span className="text-red-500">*</span></Label>
                <Input id="commission" type="number" min="0" max="100" value={commission} onChange={(e) => setCommission(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">স্ট্যাটাস</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>বাতিল</Button>
            <Button className="h-11 bg-[#f47920] hover:bg-[#e56910]" disabled={creating} onClick={createVendor}>
              {creating ? "যোগ হচ্ছে..." : "বিক্রেতা যোগ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor modal */}
      <Dialog open={!!editingVendor} onOpenChange={(o) => !o && setEditingVendor(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>বিক্রেতা সম্পাদনা</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_shop_name">দোকান/ডিলার নাম</Label>
              <Input
                id="edit_shop_name"
                value={editShopName}
                onChange={(e) => setEditShopName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_proprietor_name">প্রোপাইটর (Proprietor)</Label>
              <Input
                id="edit_proprietor_name"
                value={editProprietorName}
                onChange={(e) => setEditProprietorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">ফোন</Label>
              <Input id="edit_phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                এটি vendor record-এর ফোন; linked user account-এর login ফোন বদলায় না।
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_address">ঠিকানা</Label>
              <Input id="edit_address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_division">বিভাগ (Division)</Label>
                <Input id="edit_division" value={editDivision} onChange={(e) => setEditDivision(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_district">জেলা (District)</Label>
                <Input id="edit_district" value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_sr_name">SR নাম</Label>
                <Input id="edit_sr_name" value={editSrName} onChange={(e) => setEditSrName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_sr_mobile">SR মোবাইল</Label>
                <Input id="edit_sr_mobile" value={editSrMobile} onChange={(e) => setEditSrMobile(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_commission">কমিশন %</Label>
                <Input
                  id="edit_commission"
                  type="number"
                  min="0"
                  max="100"
                  value={editCommission}
                  onChange={(e) => setEditCommission(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">স্ট্যাটাস</Label>
                <select
                  id="edit_status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setEditingVendor(null)}
              disabled={editSaving}
            >
              Cancel
            </Button>
            <Button
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
              disabled={editSaving}
              onClick={saveEdit}
            >
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
