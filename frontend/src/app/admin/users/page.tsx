"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  UserCog,
  Pencil,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Users,
  Store,
  Phone,
  Mail,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import type { AdminUserRow, PaginatedResponse, UserRole } from "@/types";

type FilterRole = "all" | UserRole;

const FILTER_TABS: { key: FilterRole; label: string; icon: typeof Users }[] = [
  { key: "all", label: "সকল ইউজার", icon: Users },
  { key: "customer", label: "গ্রাহক (Customers)", icon: Users },
  { key: "vendor", label: "ভেন্ডর (Vendors)", icon: Store },
  { key: "delivery", label: "রাইডার (Riders)", icon: Truck },
  { key: "admin", label: "অ্যাডমিন (Admins)", icon: ShieldAlert },
  { key: "staff", label: "স্টাফ (Staff)", icon: UserCog },
];
const FILTER_ROLE_KEYS: FilterRole[] = FILTER_TABS.map((t) => t.key);

const ROLE_BADGE: Record<UserRole, { bg: string; label: string }> = {
  admin: { bg: "bg-purple-50 text-purple-700 border-purple-200", label: "অ্যাডমিন (Admin)" },
  vendor: { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "ভেন্ডর (Vendor)" },
  delivery: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "ডেলিভারি রাইডার" },
  customer: { bg: "bg-gray-100 text-gray-700 border-gray-200", label: "কাস্টমার" },
  staff: { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "স্টাফ (Staff)" },
};

function getErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === "object" && e !== null && "response" in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? fallback;
  }
  return fallback;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const initialFilter = FILTER_ROLE_KEYS.includes(searchParams.get("role") as FilterRole)
    ? (searchParams.get("role") as FilterRole)
    : "all";

  const [data, setData] = useState<PaginatedResponse<AdminUserRow> | null>(null);
  const [counts, setCounts] = useState<Record<FilterRole, number>>({
    all: 0, customer: 0, vendor: 0, delivery: 0, admin: 0, staff: 0,
  });
  const [filter, setFilter] = useState<FilterRole>(initialFilter);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Create / Edit dialog
  const currentUser = useAuthStore((s) => s.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPassword, setFPassword] = useState("");
  const [fRole, setFRole] = useState<UserRole>("customer");

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const refreshCounts = useCallback(async () => {
    const roles: UserRole[] = ["customer", "vendor", "delivery", "admin", "staff"];
    const results = await Promise.all(
      roles.map((r) =>
        api.get<PaginatedResponse<AdminUserRow>>(`/admin/users?role=${r}&per_page=1`).then((res) => res.data.total).catch(() => 0),
      ),
    );
    const next: Record<FilterRole, number> = {
      all: results.reduce((a, b) => a + b, 0),
      customer: results[0], vendor: results[1], delivery: results[2], admin: results[3], staff: results[4],
    };
    setCounts(next);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const sp = new URLSearchParams({ page: String(page), per_page: "20" });
    if (filter !== "all") sp.set("role", filter);
    if (searchDebounced.trim()) sp.set("search", searchDebounced.trim());
    api
      .get<PaginatedResponse<AdminUserRow>>(`/admin/users?${sp.toString()}`)
      .then((r) => setData(r.data))
      .catch((e) => toast.error(getErrorMessage(e, "ইউজার তালিকা লোড করা যায়নি")))
      .finally(() => setLoading(false));
  }, [page, filter, searchDebounced]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const toggleStatus = async (u: AdminUserRow) => {
    try {
      const res = await api.patch<{ data: AdminUserRow }>(`/admin/users/${u.id}/toggle-status`);
      setData((prev) => prev ? { ...prev, data: prev.data.map((x) => x.id === u.id ? { ...x, is_active: res.data.data.is_active } : x) } : prev);
      toast.success(res.data.data.is_active ? `"${u.name}" সক্রিয় করা হয়েছে` : `"${u.name}" নিষ্ক্রিয় করা হয়েছে`);
    } catch (e) {
      toast.error(getErrorMessage(e, "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে"));
    }
  };

  const changeRole = async (u: AdminUserRow, role: UserRole) => {
    try {
      const res = await api.patch<{ data: AdminUserRow }>(`/admin/users/${u.id}/role`, { role });
      setData((prev) => prev ? { ...prev, data: prev.data.map((x) => x.id === u.id ? { ...x, role: res.data.data.role } : x) } : prev);
      toast.success(`"${u.name}" এর রোল পরিবর্তিত হয়েছে`);
      refreshCounts();
    } catch (e) {
      toast.error(getErrorMessage(e, "রোল আপডেট করা যায়নি"));
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFName("");
    setFPhone("");
    setFEmail("");
    setFPassword("");
    setFRole("staff");
    setDialogOpen(true);
  };

  const openEdit = (u: AdminUserRow) => {
    setEditingUser(u);
    setFName(u.name);
    setFPhone(u.phone ?? "");
    setFEmail(u.email ?? "");
    setFPassword("");
    setFRole(u.role);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!fName.trim()) {
      toast.error("অনুগ্রহ করে ইউজারের নাম লিখুন");
      return;
    }
    if (!fPhone.trim()) {
      toast.error("মোবাইল নম্বর আবশ্যক");
      return;
    }
    if (!editingUser && !fPassword.trim()) {
      toast.error("নতুন ইউজার তৈরির সময় পাসওয়ার্ড আবশ্যক");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: fName.trim(),
        phone: fPhone.trim(),
        email: fEmail.trim() || null,
        role: fRole,
      };
      if (fPassword.trim()) body.password = fPassword;

      if (editingUser) {
        await api.patch(`/admin/users/${editingUser.id}`, body);
        toast.success("ইউজার তথ্য আপডেট হয়েছে!");
      } else {
        await api.post("/admin/users", body);
        toast.success("নতুন ইউজার সফলভাবে তৈরি হয়েছে!");
      }
      setDialogOpen(false);
      load();
      refreshCounts();
    } catch (e) {
      toast.error(getErrorMessage(e, "সংরক্ষণ ব্যর্থ হয়েছে"));
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
              ইউজার ও একাউন্ট ম্যানেজমেন্ট (Users & Roles)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              মোট {counts.all} জন ইউজার
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            অ্যাডমিন, ম্যানেজার, স্টাফ, ডেলিভারি রাইডার ও গ্রাহক অ্যাকাউন্ট নিয়ন্ত্রণ
          </p>
        </div>

        <Button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>নতুন স্টাফ/ইউজার তৈরি করুন</span>
        </Button>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setFilter(tab.key); setPage(1); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                active
                  ? "bg-[#f47920] text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-orange-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                {counts[tab.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ইউজারের নাম, মোবাইল নম্বর বা ইমেইল দিয়ে খুঁজুন..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all"
          />
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[180px]">ইউজার ও ইমেইল</TableHead>
                <TableHead className="font-bold text-xs min-w-[140px]">মোবাইল নম্বর</TableHead>
                <TableHead className="font-bold text-xs min-w-[140px]">বর্তমান রোল</TableHead>
                <TableHead className="font-bold text-xs text-center">অর্ডার সংখ্যা</TableHead>
                <TableHead className="font-bold text-xs text-center">স্ট্যাটাস</TableHead>
                <TableHead className="font-bold text-xs">রোল পরিবর্তন</TableHead>
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
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    কোনো ইউজার খুঁজে পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((u) => {
                  const roleMeta = ROLE_BADGE[u.role] ?? { bg: "bg-gray-100 text-gray-700", label: u.role };
                  const isSelf = Boolean(currentUser && u.id === currentUser.id);

                  return (
                    <TableRow key={u.id} className="hover:bg-orange-50/20 transition-colors">
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#f47920] font-bold text-xs shadow-2xs">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="bg-orange-50 text-[#f47920] border border-orange-200 text-[9px] font-extrabold px-1 rounded">
                                  আপনি
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{u.email || "ইমেইল নেই"}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {u.phone ? (
                          <a
                            href={`tel:${u.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            <span>{u.phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={`text-[10px] font-bold ${roleMeta.bg}`}>
                          {roleMeta.label}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-gray-700">
                        {u.orders_count ?? 0}টি
                      </TableCell>

                      <TableCell className="text-center">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => toggleStatus(u)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            u.is_active ? "bg-emerald-500" : "bg-gray-300"
                          } ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          title={isSelf ? "নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না" : u.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                              u.is_active ? "translate-x-4.5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </TableCell>

                      <TableCell>
                        <select
                          disabled={isSelf}
                          value={u.role}
                          onChange={(e) => changeRole(u, e.target.value as UserRole)}
                          className={`h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920] ${
                            isSelf ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="staff">Staff (স্টাফ)</option>
                          <option value="delivery">Delivery (রাইডার)</option>
                          <option value="vendor">Vendor (ভেন্ডর)</option>
                          <option value="admin">Admin (অ্যাডমিন)</option>
                          <option value="customer">Customer (গ্রাহক)</option>
                        </select>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          onClick={() => openEdit(u)}
                          className="h-8 w-8 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50 p-0 ml-auto"
                          variant="ghost"
                          title="ইউজার তথ্য এডিট"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <span className="text-xs text-muted-foreground font-semibold" lang="bn">
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total} জন ইউজার)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-bold"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>আগের পৃষ্ঠা</span>
            </Button>

            {getPageNumbers(data.current_page, data.last_page).map((item, idx) => {
              if (item === "...") {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground select-none">
                    ...
                  </span>
                );
              }
              const isCurrent = item === data.current_page;
              return (
                <Button
                  key={item}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`h-9 min-w-[36px] px-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#f47920] text-white hover:bg-[#d46212] shadow-xs"
                      : "text-gray-700 hover:text-[#f47920]"
                  }`}
                  onClick={() => {
                    if (item !== page) setPage(item as number);
                  }}
                >
                  {item}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-bold"
              disabled={page >= data.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              <span>পরের পৃষ্ঠা</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              {editingUser ? "ইউজার তথ্য সম্পাদনা করুন" : "নতুন স্টাফ / ইউজার তৈরি করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                পূর্ণ নাম <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder="যেমন: মোঃ জাহিদ হাসান"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fPhone}
                onChange={(e) => setFPhone(e.target.value)}
                placeholder="যেমন: 017XXXXXXXX"
                className="h-10 rounded-xl font-mono text-xs"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">ইমেইল ঠিকানা (ঐচ্ছিক)</Label>
              <Input
                type="email"
                value={fEmail}
                onChange={(e) => setFEmail(e.target.value)}
                placeholder="user@futureshop.com"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                ইউজারের রোল (Role) <span className="text-red-500">*</span>
              </Label>
              <select
                value={fRole}
                onChange={(e) => setFRole(e.target.value as UserRole)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#f47920]"
              >
                <option value="staff">Staff — অর্ডার ও ক্যাটালগ ম্যানেজার</option>
                <option value="delivery">Delivery — ডেলিভারি রাইডার</option>
                <option value="vendor">Vendor — স্থানীয় মার্চেন্ট / সেলার</option>
                <option value="admin">Admin — ফুল সুপার অ্যাডমিন অ্যাক্সেস</option>
                <option value="customer">Customer — সাধারণ শপ ক্রেতা</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="font-bold text-gray-700" lang="bn">
                পাসওয়ার্ড {editingUser ? "(পরিবর্তন করতে চাইলে লিখুন)" : <span className="text-red-500">*</span>}
              </Label>
              <Input
                type="password"
                value={fPassword}
                onChange={(e) => setFPassword(e.target.value)}
                placeholder={editingUser ? "অপরিবর্তিত রাখতে ফাঁকা রাখুন" : "কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"}
                className="h-10 rounded-xl font-mono text-xs"
              />
            </div>

          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={saving}
            >
              বাতিল
            </Button>
            <Button
              onClick={save}
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              disabled={saving}
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : editingUser ? "আপডেট করুন" : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullHeight />}>
      <AdminUsersContent />
    </Suspense>
  );
}
