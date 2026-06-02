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
import type { DeliveryZone } from "@/types";

const TK = "৳";

interface ZoneForm {
  name: string;
  areas: string;
  delivery_charge: string;
  free_delivery_threshold: string;
  is_active: boolean;
}

const EMPTY_FORM: ZoneForm = { name: "", areas: "", delivery_charge: "", free_delivery_threshold: "", is_active: true };

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ZoneForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<{ data: DeliveryZone[] }>("/admin/delivery-zones")
      .then((r) => setZones(r.data.data))
      .catch(() => toast.error("Failed to load zones"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (zone: DeliveryZone) => {
    setEditingId(zone.id);
    setForm({
      name: zone.name,
      areas: zone.areas ?? "",
      delivery_charge: String(zone.delivery_charge),
      free_delivery_threshold: zone.free_delivery_threshold ? String(zone.free_delivery_threshold) : "",
      is_active: zone.is_active,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || form.delivery_charge === "") {
      toast.error("জোনের নাম ও চার্জ দিন");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      areas: form.areas || null,
      delivery_charge: Number(form.delivery_charge),
      free_delivery_threshold: form.free_delivery_threshold ? Number(form.free_delivery_threshold) : null,
      is_active: form.is_active,
    };
    try {
      if (editingId) {
        await api.put(`/admin/delivery-zones/${editingId}`, payload);
      } else {
        await api.post("/admin/delivery-zones", payload);
      }
      toast.success("জোন সংরক্ষিত হয়েছে");
      setOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery Zones</h1>
        <Button className="h-11 bg-[#1a6bdf] hover:bg-[#1559bd]" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Zone
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : zones.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No zones yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Areas</TableHead>
                    <TableHead>Base charge</TableHead>
                    <TableHead>Free threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">{zone.areas ?? "—"}</TableCell>
                      <TableCell>{TK}{Number(zone.delivery_charge).toLocaleString("en-US")}</TableCell>
                      <TableCell>{zone.free_delivery_threshold ? `${TK}${Number(zone.free_delivery_threshold).toLocaleString("en-US")}` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={zone.is_active ? "border-green-300 text-green-700" : "border-gray-300 text-gray-500"}>
                          {zone.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => openEdit(zone)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Zone" : "Add Zone"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="z-name">Zone name</Label>
              <Input id="z-name" className="h-11" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="z-areas">Areas (comma-separated upazilas)</Label>
              <textarea
                id="z-areas"
                rows={2}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.areas}
                onChange={(e) => setForm({ ...form, areas: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="z-charge">Base charge (৳)</Label>
                <Input id="z-charge" className="h-11" type="number" min="0" value={form.delivery_charge} onChange={(e) => setForm({ ...form, delivery_charge: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="z-free">Free threshold (৳)</Label>
                <Input id="z-free" className="h-11" type="number" min="0" value={form.free_delivery_threshold} onChange={(e) => setForm({ ...form, free_delivery_threshold: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="h-11 bg-[#1a6bdf] hover:bg-[#1559bd]" disabled={saving} onClick={submit}>Save Zone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
