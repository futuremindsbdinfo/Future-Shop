"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Store,
  Pencil,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Percent,
  CheckCircle2,
  Clock,
  Ban,
  Building2,
  Sparkles,
  Layers,
  Wallet,
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
import type { Brand, PaginatedResponse, Vendor } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

/**
 * Searchable checkbox list of brands
 */
function BrandSelector({
  brands,
  selected,
  onToggle,
}: {
  brands: Brand[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="font-bold text-xs text-gray-700">অনুমোদিত ব্র্যান্ডসমূহ (Associated Brands)</Label>
        <span className="text-[11px] font-bold text-[#f47920] bg-orange-50 px-2 py-0.5 rounded-md">
          {selected.length}টি ব্র্যান্ড নির্বাচিত
        </span>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <Input
          placeholder="ব্র্যান্ডের নাম দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-xs rounded-xl"
        />
      </div>
      <div className="max-h-36 space-y-1 overflow-y-auto rounded-2xl border border-gray-200 p-2 bg-gray-50/50">
        {filtered.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">কোনো ব্র্যান্ড পাওয়া যায়নি</p>
        ) : (
          filtered.map((b) => {
            const isChecked = selected.includes(b.id);
            return (
              <label
                key={b.id}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors ${
                  isChecked ? "bg-orange-100/60 text-[#f47920] font-bold" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(b.id)}
                  className="h-4 w-4 shrink-0 rounded accent-[#f47920]"
                />
                <span className="text-xs">{b.name}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function VendorTableRow({
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

  const saveCommission = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/vendors/${vendor.id}`, { commission_rate: Number(commission) });
      toast.success("কমিশন রেট আপডেট হয়েছে!");
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error, "আপডেট ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  const statusMeta =
    vendor.status === "approved"
      ? { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "অনুমোদিত (Approved)" }
      : vendor.status === "suspended"
      ? { bg: "bg-red-50 text-red-700 border-red-200", label: "স্থগিত (Suspended)" }
      : { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "পেন্ডিং (Pending)" };

  return (
    <TableRow className="hover:bg-orange-50/20 transition-colors">
      
      {/* Shop & Brands */}
      <TableCell>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#f47920] font-bold text-sm shadow-2xs mt-0.5">
            {vendor.shop_name.charAt(0).toUpperCase()}
          </span>
          <div className="space-y-1 min-w-0">
            <p className="font-extrabold text-gray-900 text-xs">{vendor.shop_name}</p>
            {vendor.proprietor_name && (
              <p className="text-[11px] text-gray-600 font-medium">মালিক: {vendor.proprietor_name}</p>
            )}
            {vendor.brands && vendor.brands.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {vendor.brands.slice(0, 3).map((b) => (
                  <span key={b.id} className="bg-gray-100 text-gray-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                    {b.name}
                  </span>
                ))}
                {vendor.brands.length > 3 && (
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    +{vendor.brands.length - 3}টি
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Contact & Address */}
      <TableCell>
        <div className="space-y-1">
          {vendor.phone ? (
            <a
              href={`tel:${vendor.phone}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Phone className="w-2.5 h-2.5" />
              <span>{vendor.phone}</span>
            </a>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
          {vendor.district && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span>{vendor.district}{vendor.division ? `, ${vendor.division}` : ""}</span>
            </p>
          )}
        </div>
      </TableCell>

      {/* Commission Rate */}
      <TableCell>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Input
              type="number"
              min="0"
              max="100"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="h-8 w-16 text-xs font-mono font-bold text-center rounded-lg pr-4"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">%</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2 rounded-lg text-xs font-bold border-orange-200 text-[#f47920] hover:bg-orange-50"
            disabled={saving || commission === String(vendor.commission_rate)}
            onClick={saveCommission}
          >
            {saving ? "..." : "সেভ"}
          </Button>
        </div>
      </TableCell>

      {/* Net Earnings */}
      <TableCell className="font-mono font-bold text-gray-900 text-xs">
        {formatTaka(vendor.net_earnings ?? 0)}
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge className={`text-[10px] font-bold ${statusMeta.bg}`}>
          {statusMeta.label}
        </Badge>
      </TableCell>

      {/* Action */}
      <TableCell className="text-right">
        <Button
          variant="ghost"
          className="h-8 w-8 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50 p-0 ml-auto"
          onClick={() => onEdit(vendor)}
          title="ভেন্ডর তথ্য এডিট"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </TableCell>

    </TableRow>
  );
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Add Vendor Form
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
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [creating, setCreating] = useState(false);

  // All brands for selector
  const [brands, setBrands] = useState<Brand[]>([]);
  const toggleBrand = (id: number) =>
    setBrandIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleEditBrand = (id: number) =>
    setEditBrandIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Edit dialog
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
  const [editBrandIds, setEditBrandIds] = useState<number[]>([]);
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<PaginatedResponse<Vendor>>("/admin/vendors?per_page=100")
      .then((r) => setVendors(r.data.data))
      .catch(() => toast.error("ভেন্ডর তালিকা লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get<PaginatedResponse<Brand>>("/admin/brands?per_page=100")
      .then((r) => setBrands(r.data.data))
      .catch(() => {});
  }, []);

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
    setEditBrandIds(vendor.brands?.map((b) => b.id) ?? []);
  };

  const saveEdit = async () => {
    if (!editingVendor) return;
    if (!editShopName.trim()) {
      toast.error("দোকানের নাম আবশ্যক");
      return;
    }
    setEditSaving(true);
    try {
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
        brand_ids: editBrandIds,
      });
      toast.success("ভেন্ডর তথ্য আপডেট হয়েছে!");
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
      toast.error("দোকানের নাম ও মোবাইল নম্বর আবশ্যক");
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
        brand_ids: brandIds,
      });
      toast.success("নতুন ভেন্ডর সফলভাবে যোগ হয়েছে!");
      setOpen(false);
      setShopName("");
      setProprietorName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setDivision("");
      setDistrict("");
      setSrName("");
      setSrMobile("");
      setBrandIds([]);
      load();
    } catch (error) {
      const resp = (
        error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }
      ).response;
      const errs = resp?.data?.errors;
      if (errs?.phone) {
        toast.error("এই ফোন নম্বরে ইতোমধ্যে একজন ইউজার নিবন্ধিত আছেন।");
      } else if (errs?.email) {
        toast.error("এই ইমেইলে ইতোমধ্যে একজন ইউজার নিবন্ধিত আছেন।");
      } else {
        toast.error(getErrorMessage(error, "ভেন্ডর যোগ ব্যর্থ হয়েছে"));
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      v.shop_name.toLowerCase().includes(q) ||
      (v.proprietor_name && v.proprietor_name.toLowerCase().includes(q)) ||
      (v.phone && v.phone.includes(q)) ||
      (v.district && v.district.toLowerCase().includes(q))
    );
  });

  const activeCount = vendors.filter((v) => v.status === "approved").length;
  const totalEarnings = vendors.reduce((acc, v) => acc + (v.net_earnings ?? 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              ভেন্ডর ও ডিলার ম্যানেজমেন্ট (Vendors & Merchants)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              মোট {vendors.length}টি দোকান
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            মার্চেন্ট নেটওয়ার্ক, কমিশন রেট, ডিলার ক্যাটালগ ও ব্র্যান্ড পার্টনারশিপ
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন ভেন্ডর যোগ করুন</span>
        </Button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#f47920]">
              <Store className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-gray-500" lang="bn">নিবন্ধিত মোট ভেন্ডর</p>
              <p className="text-xl font-black text-gray-900 font-mono mt-0.5">{vendors.length}টি দোকান</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-gray-500" lang="bn">সক্রিয় অনুমোদিত পার্টনার</p>
              <p className="text-xl font-black text-emerald-700 font-mono mt-0.5">{activeCount}টি</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Wallet className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold text-gray-500" lang="bn">সর্বমোট ভেন্ডর আয়</p>
              <p className="text-xl font-black text-gray-900 font-mono mt-0.5">{formatTaka(totalEarnings)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="দোকানের নাম, মালিকের নাম, ফোন বা জেলা দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all"
          />
        </div>
      </div>

      {/* Vendors Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[200px]">দোকান ও ব্র্যান্ডসমূহ</TableHead>
                <TableHead className="font-bold text-xs min-w-[160px]">যোগাযোগ ও জেলা</TableHead>
                <TableHead className="font-bold text-xs min-w-[140px]">কমিশন হার (%)</TableHead>
                <TableHead className="font-bold text-xs">মোট আয়</TableHead>
                <TableHead className="font-bold text-xs">স্ট্যাটাস</TableHead>
                <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : filteredVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো ভেন্ডর পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                filteredVendors.map((vendor) => (
                  <VendorTableRow
                    key={vendor.id}
                    vendor={vendor}
                    onSaved={load}
                    onEdit={openEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              নতুন বিক্রেতা / ভেন্ডর যোগ করুন
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">
                  দোকান / ডিলার নাম <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="যেমন: আব্দুল্লাহ এন্টারপ্রাইজ"
                  className="h-10 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">মালিক / প্রোপাইটরের নাম</Label>
                <Input
                  value={proprietorName}
                  onChange={(e) => setProprietorName(e.target.value)}
                  placeholder="যেমন: রেজাউল করিম"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">
                  মোবাইল নম্বর <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-10 rounded-xl font-mono text-xs"
                  required
                />
                <p className="text-[10px] text-muted-foreground">এই মোবাইল দিয়ে ভেন্ডর ইউজার অ্যাকাউন্ট তৈরি হবে।</p>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">ইমেইল ঠিকানা (ঐচ্ছিক)</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@futureshop.com"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">দোকানের ঠিকানা</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: কলেজ রোড, শেরপুর"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">জেলা (District)</Label>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="যেমন: বগুড়া"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">বিভাগ (Division)</Label>
                <Input
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="যেমন: রাজশাহী"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">SR / প্রতিনিধির নাম</Label>
                <Input
                  value={srName}
                  onChange={(e) => setSrName(e.target.value)}
                  placeholder="যেমন: শামীম আহমেদ"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">SR মোবাইল নম্বর</Label>
                <Input
                  value={srMobile}
                  onChange={(e) => setSrMobile(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">
                  কমিশন রেট (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">স্ট্যাটাস</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f47920]"
                >
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="pending">পেন্ডিং (Pending)</option>
                  <option value="suspended">স্থগিত (Suspended)</option>
                </select>
              </div>
            </div>

            <BrandSelector brands={brands} selected={brandIds} onToggle={toggleBrand} />

          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" className="h-10 rounded-xl text-xs" onClick={() => setOpen(false)}>
              বাতিল
            </Button>
            <Button
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              disabled={creating}
              onClick={createVendor}
            >
              {creating ? "সংরক্ষণ হচ্ছে..." : "বিক্রেতা যোগ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Modal */}
      <Dialog open={!!editingVendor} onOpenChange={(o) => !o && setEditingVendor(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              ভেন্ডর তথ্য সম্পাদনা করুন
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">দোকানের নাম <span className="text-red-500">*</span></Label>
                <Input
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">প্রোপাইটরের নাম</Label>
                <Input
                  value={editProprietorName}
                  onChange={(e) => setEditProprietorName(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">ফোন নম্বর</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="h-10 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">ঠিকানা</Label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">জেলা</Label>
                <Input
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">বিভাগ</Label>
                <Input
                  value={editDivision}
                  onChange={(e) => setEditDivision(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">SR নাম</Label>
                <Input
                  value={editSrName}
                  onChange={(e) => setEditSrName(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">SR মোবাইল</Label>
                <Input
                  value={editSrMobile}
                  onChange={(e) => setEditSrMobile(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">কমিশন %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editCommission}
                  onChange={(e) => setEditCommission(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-gray-700" lang="bn">স্ট্যাটাস</Label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f47920]"
                >
                  <option value="approved">অনুমোদিত (Approved)</option>
                  <option value="pending">পেন্ডিং (Pending)</option>
                  <option value="suspended">স্থগিত (Suspended)</option>
                </select>
              </div>
            </div>

            <BrandSelector brands={brands} selected={editBrandIds} onToggle={toggleEditBrand} />

          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              onClick={() => setEditingVendor(null)}
              disabled={editSaving}
            >
              বাতিল
            </Button>
            <Button
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              disabled={editSaving}
              onClick={saveEdit}
            >
              {editSaving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
