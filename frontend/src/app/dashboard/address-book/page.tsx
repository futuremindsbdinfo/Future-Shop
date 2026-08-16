"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
  Home,
  Briefcase,
  Phone,
  Building,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Address } from "@/types";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function AddressBookPage() {
  const { hydrated, isAuthenticated, user } = useDashboardAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  const [fLabel, setFLabel] = useState("বাসা (Home)");
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fDistrict, setFDistrict] = useState("বগুড়া");
  const [fDivision, setFDivision] = useState("রাজশাহী");
  const [fIsDefault, setFIsDefault] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Address[] }>("/addresses");
      setAddresses(res.data.data ?? []);
    } catch {
      /* handled */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      loadAddresses();
    }
  }, [hydrated, isAuthenticated, loadAddresses]);

  if (!hydrated) return null;

  const openCreate = () => {
    setEditTarget(null);
    setFLabel("বাসা (Home)");
    setFName(user?.name ?? "");
    setFPhone(user?.phone ?? "");
    setFAddress("");
    setFDistrict("বগুড়া");
    setFDivision("রাজশাহী");
    setFIsDefault(addresses.length === 0);
    setFormOpen(true);
  };

  const openEdit = (a: Address) => {
    setEditTarget(a);
    setFLabel(a.label ?? "বাসা (Home)");
    setFName(a.recipient_name);
    setFPhone(a.phone);
    setFAddress(a.address);
    setFDistrict(a.district ?? "বগুড়া");
    setFDivision(a.division ?? "রাজশাহী");
    setFIsDefault(a.is_default);
    setFormOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim() || !fPhone.trim() || !fAddress.trim()) {
      toast.error("অনুগ্রহ করে নাম, ফোন নম্বর ও বিস্তারিত ঠিকানা পূরণ করুন।");
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/addresses/${editTarget.id}`, {
          label: fLabel.trim() || undefined,
          recipient_name: fName.trim(),
          phone: fPhone.trim(),
          address: fAddress.trim(),
          district: fDistrict.trim() || undefined,
          division: fDivision.trim() || undefined,
        });
        toast.success("ডেলিভারি ঠিকানা সফলভাবে আপডেট হয়েছে!");
      } else {
        await api.post("/addresses", {
          label: fLabel.trim() || undefined,
          recipient_name: fName.trim(),
          phone: fPhone.trim(),
          address: fAddress.trim(),
          district: fDistrict.trim() || undefined,
          division: fDivision.trim() || undefined,
          is_default: fIsDefault,
        });
        toast.success("নতুন ডেলিভারি ঠিকানা সফলভাবে যুক্ত হয়েছে!");
      }
      setFormOpen(false);
      loadAddresses();
    } catch (error) {
      toast.error(getErrorMessage(error, "ঠিকানা সেভ করতে সমস্যা হয়েছে।"));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await api.put(`/addresses/${id}/default`);
      toast.success("ডিফল্ট ডেলিভারি ঠিকানা হিসেবে সেট করা হয়েছে");
      loadAddresses();
    } catch (error) {
      toast.error(getErrorMessage(error, "ডিফল্ট ঠিকানা পরিবর্তন ব্যর্থ হয়েছে"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/addresses/${deleteTarget.id}`);
      toast.success("ঠিকানাটি মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
      loadAddresses();
    } catch (error) {
      toast.error(getErrorMessage(error, "ঠিকানা মোছা যায়নি"));
    } finally {
      setDeleting(false);
    }
  };

  const getLabelIcon = (label?: string) => {
    if (!label) return <MapPin className="w-4 h-4 text-[#f47920]" />;
    if (label.includes("অফিস") || label.toLowerCase().includes("office")) {
      return <Briefcase className="w-4 h-4 text-blue-600" />;
    }
    return <Home className="w-4 h-4 text-[#f47920]" />;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
            আমার সংরক্ষিত ডেলিভারি ঠিকানা (Address Book)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5" lang="bn">
            দ্রুত চেকআউটের জন্য আপনার বাসা, অফিস বা প্রিয়জনদের ঠিকানা সংরক্ষণ করুন
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>নতুন ঠিকানা যোগ করুন</span>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#f47920]" />
          <p className="text-sm text-muted-foreground font-medium" lang="bn">
            সংরক্ষিত ঠিকানা লোড হচ্ছে...
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#f47920]">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900" lang="bn">
            কোনো সংরক্ষিত ঠিকানা নেই
          </h2>
          <p className="text-xs text-muted-foreground" lang="bn">
            দ্রুত ও ঝামেলাহীন চেকআউটের জন্য আপনার ডেলিভারি ঠিকানা যোগ করে রাখুন।
          </p>
          <Button
            onClick={openCreate}
            className="h-11 px-6 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>ঠিকানা যোগ করুন</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={cn(
                "bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xs",
                a.is_default
                  ? "border-orange-300 ring-2 ring-orange-100 shadow-sm"
                  : "border-gray-200 hover:border-[#f47920]/40 hover:shadow-md"
              )}
            >
              <div className="space-y-2.5">
                {/* Card Top: Label & Default Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-orange-50 shrink-0">
                      {getLabelIcon(a.label)}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {a.label || "ডেলিভারি ঠিকানা"}
                    </span>
                  </div>

                  {a.is_default && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold gap-1 px-2.5 py-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>ডিফল্ট ঠিকানা</span>
                    </Badge>
                  )}
                </div>

                {/* Recipient details */}
                <div className="space-y-1 text-xs text-gray-700 pt-1">
                  <p className="text-sm font-bold text-gray-900">{a.recipient_name}</p>
                  <p className="flex items-center gap-1.5 text-gray-600 font-mono">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{a.phone}</span>
                  </p>
                  <p className="flex items-start gap-1.5 text-gray-600 leading-relaxed pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {a.address}
                      {a.district && `, ${a.district}`}
                      {a.division && `, ${a.division}`}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {!a.is_default ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(a.id)}
                    className="text-xs font-bold text-[#f47920] hover:text-[#d46212] flex items-center gap-1 transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>ডিফল্ট করুন</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    বর্তমান ডিফল্ট
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(a)}
                    className="h-8 px-2.5 rounded-lg text-xs font-semibold text-gray-700 border-gray-200 hover:text-[#f47920] hover:border-[#f47920]"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    <span>এডিট</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteTarget(a)}
                    className="h-8 px-2.5 rounded-lg text-xs font-semibold text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>মুছুন</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-gray-900" lang="bn">
              {editTarget ? "ঠিকানা সংশোধন করুন" : "নতুন ডেলিভারি ঠিকানা যুক্ত করুন"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
            {/* Address Label Pills */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">ঠিকানার ধরন (Label)</Label>
              <div className="flex gap-2">
                {["বাসা (Home)", "অফিস (Office)", "অন্যান্য"].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setFLabel(lbl)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      fLabel === lbl
                        ? "bg-[#f47920] text-white border-[#f47920]"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-name" className="text-xs font-bold text-gray-700">
                  প্রাপকের নাম *
                </Label>
                <Input
                  id="addr-name"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="যেমন: মোঃ কামরুল ইসলাম"
                  className="h-10 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-phone" className="text-xs font-bold text-gray-700">
                  মোবাইল নম্বর *
                </Label>
                <Input
                  id="addr-phone"
                  value={fPhone}
                  onChange={(e) => setFPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="h-10 rounded-xl text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* Full Street Address */}
            <div className="space-y-1.5">
              <Label htmlFor="addr-full" className="text-xs font-bold text-gray-700">
                বিস্তারিত ঠিকানা (বাড়ি নং, রোড নং, এলাকা/মহল্লা) *
              </Label>
              <textarea
                id="addr-full"
                value={fAddress}
                onChange={(e) => setFAddress(e.target.value)}
                placeholder="যেমন: সান্নালপাড়া, সোনালী ব্যাংকের পেছনে, শেরপুর বাসস্ট্যান্ড"
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-[#f47920] focus:ring-1 focus:ring-[#f47920] bg-white resize-none"
                required
              />
            </div>

            {/* District & Division */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr-dist" className="text-xs font-bold text-gray-700">
                  জেলা
                </Label>
                <Input
                  id="addr-dist"
                  value={fDistrict}
                  onChange={(e) => setFDistrict(e.target.value)}
                  placeholder="বগুড়া"
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addr-div" className="text-xs font-bold text-gray-700">
                  বিভাগ
                </Label>
                <Input
                  id="addr-div"
                  value={fDivision}
                  onChange={(e) => setFDivision(e.target.value)}
                  placeholder="রাজশাহী"
                  className="h-10 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Default Checkbox (for new addresses) */}
            {!editTarget && (
              <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={fIsDefault}
                  onChange={(e) => setFIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-[#f47920] rounded"
                />
                <span>এই ঠিকানাকে ডিফল্ট ডেলিভারি ঠিকানা হিসেবে সেট করুন</span>
              </label>
            )}

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                className="h-10 rounded-xl text-xs font-bold"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              >
                {saving ? "সংরক্ষণ হচ্ছে..." : "ঠিকানা সংরক্ষণ করুন"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm rounded-3xl p-6 bg-white text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              ঠিকানাটি মুছে ফেলতে চান?
            </DialogTitle>
            <p className="text-xs text-muted-foreground" lang="bn">
              &quot;{deleteTarget?.recipient_name} - {deleteTarget?.address}&quot; ঠিকানাটি স্থায়ীভাবে মুছে ফেলা হবে।
            </p>
          </div>
          <DialogFooter className="flex-row justify-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 h-10 rounded-xl text-xs font-bold"
            >
              বাতিল
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
            >
              {deleting ? "মুছে ফেলা হচ্ছে..." : "হ্যাঁ, মুছুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
