"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
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

function VendorRow({ vendor, onSaved }: { vendor: Vendor; onSaved: () => void }) {
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
    </TableRow>
  );
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [userId, setUserId] = useState("");
  const [shopName, setShopName] = useState("");
  const [commission, setCommission] = useState("10");
  const [status, setStatus] = useState("approved");
  const [creating, setCreating] = useState(false);

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

  const createVendor = async () => {
    if (!userId || !shopName.trim()) {
      toast.error("User ID এবং দোকানের নাম দিন");
      return;
    }
    setCreating(true);
    try {
      await api.post("/admin/vendors", {
        user_id: Number(userId),
        shop_name: shopName,
        commission_rate: Number(commission),
        status,
      });
      toast.success("বিক্রেতা যোগ হয়েছে");
      setOpen(false);
      setUserId("");
      setShopName("");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "বিক্রেতা যোগ ব্যর্থ হয়েছে"));
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <VendorRow key={vendor.id} vendor={vendor} onSaved={load} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">Existing User ID</Label>
              <Input id="user_id" type="number" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g. 5" />
              <p className="text-xs text-muted-foreground">
                The user must already exist; they will be promoted to the vendor role.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop_name">Shop Name</Label>
              <Input id="shop_name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Commission %</Label>
                <Input id="commission" type="number" min="0" max="100" value={commission} onChange={(e) => setCommission(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
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
            <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="h-11 bg-[#f47920] hover:bg-[#e56910]" disabled={creating} onClick={createVendor}>
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
