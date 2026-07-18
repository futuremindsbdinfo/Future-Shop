"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { AdminUserRow, PaginatedResponse, UserRole } from "@/types";

type FilterRole = "all" | UserRole;
const FILTER_TABS: { key: FilterRole; label: string }[] = [
  { key: "all", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "vendor", label: "Vendors" },
  { key: "delivery", label: "Delivery" },
  { key: "admin", label: "Admins" },
  { key: "staff", label: "Staff" },
];
const FILTER_ROLE_KEYS: FilterRole[] = FILTER_TABS.map((t) => t.key);

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-700",
  vendor: "bg-blue-100 text-blue-700",
  delivery: "bg-orange-100 text-orange-700",
  customer: "bg-gray-100 text-gray-700",
  staff: "bg-amber-100 text-amber-700",
};

function getErrorMessage(e: unknown, fallback: string): string {
  if (typeof e === "object" && e !== null && "response" in e) {
    const r = (e as { response?: { data?: { message?: string } } }).response;
    return r?.data?.message ?? fallback;
  }
  return fallback;
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

  // Create / Edit dialog (Batch E-2).
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

  // Refresh tab counts whenever data changes by hitting the API per role once.
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
    const sp = new URLSearchParams({ page: String(page), per_page: "15" });
    if (filter !== "all") sp.set("role", filter);
    if (searchDebounced) sp.set("search", searchDebounced);
    api
      .get<PaginatedResponse<AdminUserRow>>(`/admin/users?${sp.toString()}`)
      .then((r) => setData(r.data))
      .catch((e) => toast.error(getErrorMessage(e, "Failed to load users")))
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
      toast.success(res.data.data.is_active ? "User activated" : "User deactivated");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to update status"));
    }
  };

  const changeRole = async (u: AdminUserRow, role: UserRole) => {
    try {
      const res = await api.patch<{ data: AdminUserRow }>(`/admin/users/${u.id}/role`, { role });
      setData((prev) => prev ? { ...prev, data: prev.data.map((x) => x.id === u.id ? { ...x, role: res.data.data.role } : x) } : prev);
      toast.success("Role updated");
      refreshCounts();
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed to update role"));
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFName("");
    setFPhone("");
    setFEmail("");
    setFPassword("");
    setFRole("customer");
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

  const isEditingSelf = editingUser && currentUser && editingUser.id === currentUser.id;

  const save = async () => {
    if (!fName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!fPhone.trim()) {
      toast.error("Phone is required");
      return;
    }
    if (!editingUser && !fPassword.trim()) {
      toast.error("Password is required when creating a user");
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
        toast.success("User updated");
      } else {
        await api.post("/admin/users", body);
        toast.success("User created");
      }
      setDialogOpen(false);
      load();
      refreshCounts();
    } catch (e) {
      toast.error(getErrorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button
          onClick={openCreate}
          className="h-11 min-w-[44px] bg-[#f47920] hover:bg-[#e56910]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setFilter(tab.key); setPage(1); }}
              className={`flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors ${
                active ? "bg-[#f47920] text-white" : "border border-[#e5e7eb] text-[#374151] hover:bg-[#fff7ed]"
              }`}
            >
              {tab.label}
              <Badge className={active ? "bg-white text-[#f47920]" : "bg-[#f3f4f6] text-[#6b7280]"}>
                {counts[tab.key] ?? 0}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <Input
        className="h-11 max-w-md"
        placeholder="Search by name, phone, or email…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : !data || data.data.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No users found.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f3f4f6] text-left text-[11px] uppercase tracking-wide text-[#9ca3af]">
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Orders</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.data.map((u) => (
                        <tr key={u.id} className="border-b border-[#f3f4f6] last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#374151]">{u.phone ?? "—"}</td>
                          <td className="max-w-[180px] truncate px-4 py-3 text-[#6b7280]">{u.email ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_BADGE[u.role]}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">{u.orders_count ?? 0}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => toggleStatus(u)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${u.is_active ? "bg-green-500" : "bg-gray-300"}`}
                              aria-label={u.is_active ? "Deactivate" : "Activate"}
                            >
                              <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${u.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <select
                                value={u.role}
                                onChange={(e) => changeRole(u, e.target.value as UserRole)}
                                className="h-9 rounded-md border border-[#e5e7eb] bg-transparent px-2 text-xs"
                                aria-label="Change role"
                              >
                                <option value="customer">customer</option>
                                <option value="vendor">vendor</option>
                                <option value="delivery">delivery</option>
                                <option value="admin">admin</option>
                                <option value="staff">staff</option>
                              </select>
                              <Button
                                onClick={() => openEdit(u)}
                                variant="ghost"
                                className="h-10 w-10 p-0"
                                aria-label={`Edit ${u.name}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <ul className="md:hidden divide-y divide-[#f3f4f6]">
                {data.data.map((u) => (
                  <li key={u.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f47920] text-sm font-semibold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-xs text-[#6b7280]">{u.phone ?? "—"} · {u.email ?? "—"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                          <span className="text-[11px] text-[#6b7280]">{u.orders_count ?? 0} orders</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${u.is_active ? "bg-green-500" : "bg-gray-300"}`}
                        aria-label={u.is_active ? "Deactivate" : "Activate"}
                      >
                        <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${u.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value as UserRole)}
                      className="mt-3 h-11 w-full rounded-md border border-[#e5e7eb] bg-transparent px-3 text-sm"
                    >
                      <option value="customer">customer</option>
                      <option value="vendor">vendor</option>
                      <option value="delivery">delivery</option>
                      <option value="admin">admin</option>
                      <option value="staff">staff</option>
                    </select>
                    <Button
                      onClick={() => openEdit(u)}
                      variant="outline"
                      className="mt-2 h-11 w-full"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" className="h-11" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {data.current_page} of {data.last_page}</span>
          <Button variant="outline" className="h-11" disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? `Edit ${editingUser.name}` : "Create User"}
            </DialogTitle>
          </DialogHeader>

          {isEditingSelf && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              You cannot edit your own account. Use your profile settings.
            </p>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                className="h-11"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                disabled={!!isEditingSelf}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Phone <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                className="h-11"
                value={fPhone}
                onChange={(e) => setFPhone(e.target.value)}
                disabled={!!isEditingSelf}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                className="h-11"
                value={fEmail}
                onChange={(e) => setFEmail(e.target.value)}
                disabled={!!isEditingSelf}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Password{!editingUser && <span className="text-red-500"> *</span>}
              </label>
              <Input
                type="password"
                className="h-11"
                value={fPassword}
                onChange={(e) => setFPassword(e.target.value)}
                placeholder={editingUser ? "Leave blank to keep current" : "Min 8 characters"}
                disabled={!!isEditingSelf}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={fRole}
                onChange={(e) => setFRole(e.target.value as UserRole)}
                disabled={!!isEditingSelf}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="customer">customer</option>
                <option value="vendor">vendor</option>
                <option value="delivery">delivery</option>
                <option value="admin">admin</option>
                <option value="staff">staff</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="ghost"
              className="h-11"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
              disabled={saving || !!isEditingSelf}
            >
              {saving ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminUsersContent />
    </Suspense>
  );
}
