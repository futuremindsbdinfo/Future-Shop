"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  Pencil,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  Navigation,
} from "lucide-react";
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
import { formatTaka } from "@/lib/utils";
import type { DeliveryZone } from "@/types";

interface ZoneForm {
  name: string;
  areas: string;
  delivery_charge: string;
  free_delivery_threshold: string;
  estimated_days_min: string;
  estimated_days_max: string;
  is_active: boolean;
}

const EMPTY_FORM: ZoneForm = {
  name: "",
  areas: "",
  delivery_charge: "",
  free_delivery_threshold: "",
  estimated_days_min: "1",
  estimated_days_max: "2",
  is_active: true,
};

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
      .catch(() => toast.error("ডেলিভারি জোন লোড করা যায়নি"))
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
      estimated_days_min: zone.estimated_days_min ? String(zone.estimated_days_min) : "1",
      estimated_days_max: zone.estimated_days_max ? String(zone.estimated_days_max) : "2",
      is_active: zone.is_active,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || form.delivery_charge === "" || form.estimated_days_min === "" || form.estimated_days_max === "") {
      toast.error("অনুগ্রহ করে জোনের নাম, ডেলিভারি চার্জ এবং সময় দিন");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      areas: form.areas.trim() || null,
      delivery_charge: Number(form.delivery_charge),
      free_delivery_threshold: form.free_delivery_threshold ? Number(form.free_delivery_threshold) : null,
      estimated_days_min: Number(form.estimated_days_min),
      estimated_days_max: Number(form.estimated_days_max),
      is_active: form.is_active,
    };
    try {
      if (editingId) {
        await api.put(`/admin/delivery-zones/${editingId}`, payload);
        toast.success("ডেলিভারি জোন সফলভাবে আপডেট হয়েছে!");
      } else {
        await api.post("/admin/delivery-zones", payload);
        toast.success("নতুন ডেলিভারি জোন তৈরি হয়েছে!");
      }
      setOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              ডেলিভারি জোন ও চার্জ (Delivery Zones)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              মোট {zones.length}টি জোন
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            শেরপুর উপজেলা, বগুড়া জেলা ও অন্যান্য এলাকার ডেলিভারি ফি ও সময়সীমা নির্ধারণ
          </p>
        </div>

        <Button
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          <span>নতুন জোন যোগ করুন</span>
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[180px]">জোনের নাম</TableHead>
                <TableHead className="font-bold text-xs min-w-[240px]">আওতাভুক্ত এলাকা / ইউনিয়ন</TableHead>
                <TableHead className="font-bold text-xs">ডেলিভারি চার্জ</TableHead>
                <TableHead className="font-bold text-xs">ফ্রি ডেলিভারি ছাড়</TableHead>
                <TableHead className="font-bold text-xs text-center">আনুমানিক সময়</TableHead>
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
              ) : zones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো ডেলিভারি জোন খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                zones.map((zone) => (
                  <TableRow key={zone.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#f47920]">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span className="font-bold text-gray-900">{zone.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-gray-600 text-[11px] line-clamp-2 max-w-[280px]">
                        {zone.areas || <span className="text-muted-foreground">সমগ্র জোন আওতাভুক্ত</span>}
                      </p>
                    </TableCell>

                    <TableCell className="font-bold text-gray-900 font-mono text-sm">
                      {formatTaka(Number(zone.delivery_charge))}
                    </TableCell>

                    <TableCell>
                      {zone.free_delivery_threshold ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          <span>{formatTaka(Number(zone.free_delivery_threshold))} বা তদূর্ধ্ব অর্ডারে ফ্রি</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-gray-700 font-semibold text-[11px]">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{zone.estimated_days_min}-{zone.estimated_days_max} দিন</span>
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`text-[10px] font-bold ${
                          zone.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {zone.is_active ? "সক্রিয় (Active)" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 rounded-xl text-gray-600 hover:text-[#f47920] hover:bg-orange-50 text-xs font-bold"
                        onClick={() => openEdit(zone)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        <span>এডিট</span>
                      </Button>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              {editingId ? "ডেলিভারি জোন এডিট করুন" : "নতুন ডেলিভারি জোন যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            {/* Zone Name */}
            <div className="space-y-1.5">
              <Label htmlFor="z-name" className="font-bold text-gray-700" lang="bn">
                জোনের নাম <span className="text-red-500">*</span>
              </Label>
              <Input
                id="z-name"
                className="h-10 rounded-xl text-xs"
                placeholder="যেমন: শেরপুর পৌরসভা, শেরপুর বগুড়া"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Areas */}
            <div className="space-y-1.5">
              <Label htmlFor="z-areas" className="font-bold text-gray-700" lang="bn">
                আওতাভুক্ত ইউনিয়ন / এলাকা (কমা দিয়ে লিখুন)
              </Label>
              <textarea
                id="z-areas"
                rows={3}
                className="flex w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-xs outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all resize-none leading-relaxed"
                placeholder="যেমন: কুসুম্বী, গাড়ীদহ, খানপুর, মির্জাপুর, ভবানীপুর..."
                value={form.areas}
                onChange={(e) => setForm({ ...form, areas: e.target.value })}
              />
            </div>

            {/* Pricing & Free Threshold */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="z-charge" className="font-bold text-gray-700" lang="bn">
                  ডেলিভারি চার্জ (৳) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="z-charge"
                  className="h-10 rounded-xl font-mono text-xs"
                  type="number"
                  min="0"
                  placeholder="যেমন: 30"
                  value={form.delivery_charge}
                  onChange={(e) => setForm({ ...form, delivery_charge: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="z-free" className="font-bold text-gray-700" lang="bn">
                  ফ্রি ডেলিভারি ছাড় (৳)
                </Label>
                <Input
                  id="z-free"
                  className="h-10 rounded-xl font-mono text-xs"
                  type="number"
                  min="0"
                  placeholder="যেমন: 500"
                  value={form.free_delivery_threshold}
                  onChange={(e) => setForm({ ...form, free_delivery_threshold: e.target.value })}
                />
              </div>
            </div>

            {/* Estimated Delivery Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="z-min-days" className="font-bold text-gray-700" lang="bn">
                  সর্বনিম্ন সময় (দিন) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="z-min-days"
                  className="h-10 rounded-xl font-mono text-xs"
                  type="number"
                  min="0"
                  value={form.estimated_days_min}
                  onChange={(e) => setForm({ ...form, estimated_days_min: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="z-max-days" className="font-bold text-gray-700" lang="bn">
                  সর্বোচ্চ সময় (দিন) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="z-max-days"
                  className="h-10 rounded-xl font-mono text-xs"
                  type="number"
                  min="0"
                  value={form.estimated_days_max}
                  onChange={(e) => setForm({ ...form, estimated_days_max: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Is Active */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
              />
              <span className="font-bold text-gray-800" lang="bn">
                ওয়েবসাইটে অবিলম্বে সক্রিয় রাখুন (Active)
              </span>
            </label>

          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              onClick={() => setOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              disabled={saving}
              onClick={submit}
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : editingId ? "আপডেট করুন" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
