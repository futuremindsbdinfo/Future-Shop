"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, ImageOff, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import type { Brand, Category, PaginatedResponse, Product } from "@/types";

const TK = "৳";

// Canonical fields a CSV column can map to. Must match the server-side allowlist
// in AdminMappedImportController::ALLOWED_FIELDS.
const FIELD_OPTIONS = [
  { value: "ignore", label: "Ignore (skip)" },
  { value: "name", label: "Product Name *" },
  { value: "category", label: "Category *" },
  { value: "price", label: "Selling Price *" },
  { value: "cost_price", label: "Trade / Cost Price" },
  { value: "sale_price", label: "Sale Price (Discount)" },
  { value: "stock_quantity", label: "Quantity / Stock" },
  { value: "weight", label: "Weight" },
  { value: "sku", label: "SKU / Item Code" },
  { value: "description", label: "Add to Description" },
] as const;

function autoMap(header: string): string {
  const h = header.toLowerCase().trim();
  if (h.includes("product name") || h === "item name" || h === "name") return "name";
  if (h.includes("category")) return "category";
  if (h.includes("selling price") || h === "mrp") return "price";
  if (h.includes("trade price") || h.includes("trade") || h.includes("cost")) return "cost_price";
  if (h.includes("sale price") || h.includes("discount")) return "sale_price";
  if (h.includes("qtn") || h.includes("qty") || h.includes("quantity") || h.includes("stock")) return "stock_quantity";
  if (h === "weight") return "weight";
  if (h === "sku" || h.includes("item code")) return "sku";
  if (["size", "flavour", "flavor", "quality", "gift", "cp", "colour", "color"].some((k) => h.includes(k))) return "description";
  if (h === "profit" || h === "sl" || h === "no" || h === "#") return "ignore";
  return "ignore";
}

function AdminProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  const setPage = (val: number | ((p: number) => number)) => {
    const next = typeof val === "function" ? val(page) : val;
    const params = new URLSearchParams(searchParams.toString());
    if (next === 1 || next < 1) {
      params.delete("page");
    } else {
      params.set("page", String(next));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Bulk Mode state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // CSV import wizard state.
  const [importOpen, setImportOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [wizardVendorId, setWizardVendorId] = useState<string>("");
  const [wizardVendors, setWizardVendors] = useState<{ id: number; shop_name: string }[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: { row: number; data: Record<string, string>; error: string }[];
    total: number;
  } | null>(null);

  useEffect(() => {
    api.get<{ data: Category[] }>("/admin/categories").then((r) => setCategories(r.data.data)).catch(() => {});
    api.get<PaginatedResponse<Brand>>("/admin/brands?per_page=100").then((r) => setBrands(r.data.data)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "15" });
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (brandFilter) params.set("brand_id", brandFilter);
    if (searchQuery) params.set("search", searchQuery);
    api
      .get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [page, categoryFilter, statusFilter, brandFilter, searchQuery]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ per_page: "5000" });
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (brandFilter) params.set("brand_id", brandFilter);
      if (searchQuery) params.set("search", searchQuery);
      const r = await api.get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`);
      const rows = r.data.data.map((p) => ({
        ID: p.id,
        Name: p.name,
        SKU: p.sku ?? "",
        Category: (p as unknown as { category?: { name?: string } }).category?.name ?? "",
        Brand: p.brand?.name ?? "",
        Price: p.price,
        "Cost Price": p.cost_price ?? "",
        "Sale Price": p.sale_price ?? "",
        Stock: p.stock_quantity,
        Status: p.status,
      }));
      const csv = [
        Object.keys(rows[0] ?? {}).join(","),
        ...rows.map((row) =>
          Object.values(row)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${rows.length}টি প্রোডাক্ট Export হয়েছে`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const toggleBulkMode = () => {
    setBulkMode((prev) => !prev);
    setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!data) return;
    if (checked) {
      setSelectedIds(data.data.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`);
      toast.success("Product deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  const executeBulkAction = async (action: "delete" | "activate" | "deactivate") => {
    setIsBulkActionLoading(true);
    try {
      await api.post("/admin/products/bulk-action", {
        ids: selectedIds,
        action,
      });
      toast.success(
        action === "delete"
          ? `${selectedIds.length}টি পণ্য মুছে ফেলা হয়েছে`
          : `${selectedIds.length}টি পণ্য আপডেট হয়েছে`
      );
      setSelectedIds([]);
      setBulkMode(false);
      if (action === "delete") setShowBulkDeleteConfirm(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Bulk action failed");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkAction = async (action: "delete" | "activate" | "deactivate") => {
    if (action === "delete") {
      setShowBulkDeleteConfirm(true);
      return;
    }
    executeBulkAction(action);
  };

  const handleToggleStatus = async (product: Product) => {
    if (product.status === "out_of_stock") return;

    const prevStatus = product.status;
    const nextStatus = prevStatus === "published" ? "draft" : "published";

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        data: prev.data.map((p) =>
          p.id === product.id ? { ...p, status: nextStatus } : p
        ),
      };
    });

    try {
      await api.patch(`/admin/products/${product.id}/toggle-status`);
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    } catch (e: unknown) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((p) =>
            p.id === product.id ? { ...p, status: prevStatus } : p
          ),
        };
      });
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Status update failed");
    }
  };

  const openWizard = async () => {
    setWizardStep(1);
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMapping({});
    setImportResult(null);
    setImporting(false);
    try {
      const res = await api.get<{ data: { id: number; shop_name: string }[] }>("/admin/vendors");
      setWizardVendors(res.data.data ?? []);
      setWizardVendorId(String(res.data.data?.[0]?.id ?? ""));
    } catch {
      setWizardVendors([]);
    }
    setImportOpen(true);
  };

  const handleCsvFile = (file: File | null) => {
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const rows = (result.data as Record<string, string>[]).filter(Boolean);
        setCsvHeaders(headers);
        setCsvRows(rows);
        const autoMapping: Record<string, string> = {};
        headers.forEach((h) => {
          autoMapping[h] = autoMap(h);
        });
        setColumnMapping(autoMapping);
        setWizardStep(2);
      },
      error: () => toast.error("CSV parse করা যায়নি। ফাইল সঠিক কিনা দেখুন।"),
    });
  };

  const runImport = async () => {
    if (!wizardVendorId) {
      toast.error("Vendor select করুন");
      return;
    }
    setImporting(true);
    try {
      const res = await api.post<{
        success: number;
        errors: { row: number; data: Record<string, string>; error: string }[];
        total: number;
      }>("/admin/products/import-mapped", {
        vendor_id: parseInt(wizardVendorId, 10),
        mapping: columnMapping,
        rows: csvRows,
      });
      setImportResult(res.data);
      setWizardStep(3);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const profitFor = (product: Product): number => {
    const price = Number(product.sale_price ?? product.price);
    const cost = Number(product.cost_price ?? 0);
    return price - cost;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">Products</h1>
          {data && (
            <span className="text-sm font-medium text-muted-foreground" lang="bn">
              মোট {data.total} টি পণ্য
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={bulkMode ? "default" : "outline"}
            className="h-11"
            onClick={toggleBulkMode}
          >
            Bulk Mode
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={openWizard}
          >
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/products/new" />} className="h-11 bg-[#f47920] hover:bg-[#e56910]">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setSearchQuery(searchInput.trim()); }}
          className="flex items-center gap-1"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === "") { setSearchQuery(""); setPage(1); }
              }}
              placeholder="Search products..."
              className="h-9 w-52 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#f47920]"
            />
          </div>
          <button
            type="submit"
            className="h-9 rounded-md bg-[#f47920] px-3 text-sm font-medium text-white hover:bg-[#e56910] transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => { setPage(1); setCategoryFilter(e.target.value); }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <select
          value={brandFilter}
          onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={String(b.id)}>{b.name}</option>
          ))}
        </select>
      </div>

      {bulkMode && selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.length}টি নির্বাচিত
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-11 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => handleBulkAction("delete")}
              disabled={isBulkActionLoading}
            >
              মুছুন
            </Button>
            <Button
              variant="outline"
              className="h-11 text-green-700 hover:bg-green-50"
              onClick={() => handleBulkAction("activate")}
              disabled={isBulkActionLoading}
            >
              Active করুন
            </Button>
            <Button
              variant="outline"
              className="h-11 text-muted-foreground hover:bg-muted/80"
              onClick={() => handleBulkAction("deactivate")}
              disabled={isBulkActionLoading}
            >
              Inactive করুন
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : !data || data.data.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No products found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {bulkMode && (
                    <TableHead className="w-[50px]">
                      <div className="flex h-11 w-11 items-center justify-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                          checked={data.data.length > 0 && selectedIds.length === data.data.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          aria-label="Select all"
                        />
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((product, index) => {
                  const img = product.images?.[0]?.url ?? null;
                  return (
                    <TableRow key={product.id}>
                      {bulkMode && (
                        <TableCell>
                          <div className="flex h-11 w-11 items-center justify-center">
                            <input
                              type="checkbox"
                              className="h-5 w-5 cursor-pointer rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                              checked={selectedIds.includes(product.id)}
                              onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                              aria-label={`Select ${product.name}`}
                            />
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-muted-foreground">
                        {(data.from ?? 1) + index}
                      </TableCell>
                      <TableCell>
                        <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                          {img ? (
                            <Image src={img} alt={product.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ImageOff className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">{product.name}</TableCell>
                      <TableCell className="text-sm">
                        {product.brand?.name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>{product.vendor?.shop_name ?? "—"}</TableCell>
                      <TableCell>{TK}{Number(product.sale_price ?? product.price).toLocaleString("en-US")}</TableCell>
                      <TableCell>{TK}{Number(product.cost_price ?? 0).toLocaleString("en-US")}</TableCell>
                      <TableCell>
                        {(() => {
                          const p = profitFor(product);
                          return (
                            <span className={p >= 0 ? "font-medium text-green-700" : "font-medium text-red-600"}>
                              {TK}{p.toLocaleString("en-US")}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell>
                        {product.status === "out_of_stock" ? (
                          <div className="flex h-11 w-max items-center justify-center rounded-full bg-muted px-4 text-xs font-medium text-muted-foreground opacity-80 cursor-not-allowed">
                            স্টক নেই
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(product)}
                            className={`flex h-11 w-max min-w-[80px] items-center justify-center rounded-full px-4 text-xs font-medium transition-colors ${
                              product.status === "published"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {product.status === "published" ? "Active" : "Inactive"}
                          </button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            nativeButton={false}
                            render={<Link href={`/admin/products/new?id=${product.id}`} />}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-red-600"
                            onClick={() => handleDelete(product)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {data && data.last_page > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" className="h-11" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {data.current_page} of {data.last_page}</span>
          <Button variant="outline" className="h-11" disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* CSV Import Wizard */}
      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          if (!open) {
            setImportOpen(false);
            setWizardStep(1);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {wizardStep === 1 && "Step 1 — CSV ফাইল আপলোড করুন"}
              {wizardStep === 2 && "Step 2 — কলাম ম্যাপিং ও Vendor"}
              {wizardStep === 3 && "Step 3 — Import ফলাফল"}
            </DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="mb-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= wizardStep ? "bg-[#f47920]" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* ── STEP 1: Upload ── */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground" lang="bn">
                যেকোনো ফরম্যাটের CSV আপলোড করুন। পরের ধাপে আপনি নির্ধারণ করবেন
                কোন কলাম কোন ফিল্ডে যাবে।
              </p>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-input p-10 text-center transition-colors hover:border-[#f47920]"
                onClick={() => document.getElementById("csv-wizard-input")?.click()}
              >
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium" lang="bn">
                  CSV ফাইল ড্র্যাগ করুন বা ক্লিক করুন
                </p>
                <p className="mt-1 text-xs text-muted-foreground" lang="bn">
                  .csv ফরম্যাট, যেকোনো হেডার
                </p>
              </div>
              <input
                id="csv-wizard-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleCsvFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {/* ── STEP 2: Column Mapping ── */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium" lang="bn">
                  Vendor নির্বাচন করুন *
                </label>
                <select
                  value={wizardVendorId}
                  onChange={(e) => setWizardVendorId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="" lang="bn">-- Vendor select করুন --</option>
                  {wizardVendors.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" lang="bn">
                  কলাম ম্যাপিং
                </label>
                <p className="mb-2 text-xs text-muted-foreground" lang="bn">
                  CSV-এর প্রতিটি কলাম কোন ফিল্ডে যাবে তা নির্বাচন করুন। তারকা (*) চিহ্নিত
                  ফিল্ড বাধ্যতামূলক।
                </p>
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium" lang="bn">
                          CSV কলাম
                        </th>
                        <th className="px-3 py-2 text-left font-medium" lang="bn">
                          ম্যাপ করুন →
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground" lang="bn">
                          নমুনা মান
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvHeaders.map((header) => (
                        <tr key={header} className="border-t">
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                            {header}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={columnMapping[header] ?? "ignore"}
                              onChange={(e) =>
                                setColumnMapping((prev) => ({
                                  ...prev,
                                  [header]: e.target.value,
                                }))
                              }
                              className="h-8 w-full rounded border border-input bg-transparent px-2 text-xs"
                            >
                              {FIELD_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="max-w-[120px] truncate px-3 py-2 text-xs text-muted-foreground">
                            {csvRows[0]?.[header] ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-xs text-muted-foreground" lang="bn">
                মোট {csvRows.length} টি পণ্য পাওয়া গেছে। Import হবে{" "}
                <strong>draft</strong> হিসেবে — পরে Publish করতে পারবেন।
              </p>

              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setWizardStep(1)} className="h-11">
                  <span lang="bn">← পেছনে</span>
                </Button>
                <Button
                  onClick={runImport}
                  disabled={importing || !wizardVendorId}
                  className="h-11 bg-[#f47920] hover:bg-[#e56910]"
                >
                  {importing ? (
                    <span lang="bn">Import হচ্ছে...</span>
                  ) : (
                    <span lang="bn">Import করুন ({csvRows.length} পণ্য)</span>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ── STEP 3: Result ── */}
          {wizardStep === 3 && importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{importResult.success}</p>
                  <p className="mt-0.5 text-xs text-green-600" lang="bn">
                    সফল
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{importResult.errors.length}</p>
                  <p className="mt-0.5 text-xs text-red-600" lang="bn">
                    ত্রুটি
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{importResult.total}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground" lang="bn">
                    মোট
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600" lang="bn">
                    ত্রুটিপূর্ণ সারি:
                  </p>
                  <div className="max-h-48 overflow-y-auto rounded-lg border text-xs">
                    {importResult.errors.map((err, i) => (
                      <div
                        key={i}
                        className="flex gap-2 border-b px-3 py-2 last:border-b-0"
                      >
                        <span className="flex-shrink-0 text-muted-foreground">
                          Row {err.row}:
                        </span>
                        <span className="text-red-600">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  onClick={() => {
                    setImportOpen(false);
                    setWizardStep(1);
                  }}
                  className="h-11 bg-[#f47920] hover:bg-[#e56910]"
                >
                  <span lang="bn">সম্পন্ন</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            Delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setDeleteTarget(null)} variant="ghost" className="h-11" disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} className="h-11 bg-red-600 text-white hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>মুছে ফেলবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            আপনি কি নিশ্চিত? <strong>{selectedIds.length}</strong>টি পণ্য মুছে যাবে।
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowBulkDeleteConfirm(false)} variant="ghost" className="h-11" disabled={isBulkActionLoading}>
              বাতিল
            </Button>
            <Button onClick={() => executeBulkAction("delete")} className="h-11 bg-red-600 text-white hover:bg-red-700" disabled={isBulkActionLoading}>
              {isBulkActionLoading ? "মুছছে..." : "মুছুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminProductsContent />
    </Suspense>
  );
}
