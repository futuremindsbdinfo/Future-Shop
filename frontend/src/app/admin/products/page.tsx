"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ImageOff,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Package,
} from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Brand, Category, PaginatedResponse, Product } from "@/types";

const FIELD_OPTIONS = [
  { value: "ignore", label: "বাদ দিন (Skip)" },
  { value: "name", label: "পণ্যের নাম (Name) *" },
  { value: "category", label: "ক্যাটাগরি (Category) *" },
  { value: "price", label: "বিক্রয় মূল্য (MRP) *" },
  { value: "cost_price", label: "ক্রয় / পাইকারি মূল্য (Cost Price)" },
  { value: "sale_price", label: "অফার / ডিসকাউন্ট মূল্য (Sale Price)" },
  { value: "stock_quantity", label: "স্টক পরিমাণ (Stock Quantity)" },
  { value: "weight", label: "ওজন (Weight)" },
  { value: "sku", label: "এসকেইউ কোড (SKU)" },
  { value: "description", label: "বিবরণ (Description)" },
] as const;

function autoMap(header: string): string {
  const h = header.toLowerCase().trim();
  if (h.includes("product name") || h === "item name" || h === "name" || h === "পণ্য") return "name";
  if (h.includes("category") || h === "ক্যাটাগরি") return "category";
  if (h.includes("selling price") || h === "mrp" || h === "price" || h === "মূল্য") return "price";
  if (h.includes("trade price") || h.includes("trade") || h.includes("cost") || h === "কেনা দাম") return "cost_price";
  if (h.includes("sale price") || h.includes("discount") || h === "অফার দাম") return "sale_price";
  if (h.includes("qtn") || h.includes("qty") || h.includes("quantity") || h.includes("stock") || h === "স্টক") return "stock_quantity";
  if (h === "weight" || h === "ওজন") return "weight";
  if (h === "sku" || h.includes("item code")) return "sku";
  if (["size", "flavour", "flavor", "quality", "gift", "cp", "colour", "color"].some((k) => h.includes(k))) return "description";
  if (h === "profit" || h === "sl" || h === "no" || h === "#") return "ignore";
  return "ignore";
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 7) {
    return [...Array.from({ length: 10 }, (_, i) => i + 1), "...", totalPages];
  }
  if (currentPage >= totalPages - 6) {
    return [1, "...", ...Array.from({ length: 10 }, (_, i) => totalPages - 9 + i)];
  }
  const start = currentPage - 4;
  return [1, "...", ...Array.from({ length: 8 }, (_, i) => start + i), "...", totalPages];
}

function AdminProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const initialPage = Number(searchParams.get("page")) || 1;
  const initialCategory = searchParams.get("category") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialBrand = searchParams.get("brand_id") || "";
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [brandFilter, setBrandFilter] = useState(initialBrand);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    const p = Number(searchParams.get("page")) || 1;
    const cat = searchParams.get("category") || "";
    const stat = searchParams.get("status") || "";
    const br = searchParams.get("brand_id") || "";
    const q = searchParams.get("search") || "";

    setPage(p);
    setCategoryFilter(cat);
    setStatusFilter(stat);
    setBrandFilter(br);
    setSearchQuery(q);
    setSearchInput(q);
  }, [searchParams]);

  const updateUrl = useCallback(
    (newPage: number, cat: string, stat: string, brand: string, search: string) => {
      const params = new URLSearchParams();
      if (newPage > 1) params.set("page", String(newPage));
      if (cat) params.set("category", cat);
      if (stat) params.set("status", stat);
      if (brand) params.set("brand_id", brand);
      if (search) params.set("search", search);

      const qs = params.toString();
      router.replace(qs ? `/admin/products?${qs}` : "/admin/products", { scroll: false });
    },
    [router]
  );

  const getReturnParams = useCallback(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (brandFilter) params.set("brand_id", brandFilter);
    if (searchQuery) params.set("search", searchQuery);
    return params.toString();
  }, [page, categoryFilter, statusFilter, brandFilter, searchQuery]);

  // Bulk Mode state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // CSV import wizard state
  const [importOpen, setImportOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [wizardVendors, setWizardVendors] = useState<{ id: number; shop_name: string }[]>([]);
  const [wizardVendorId, setWizardVendorId] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: { row: number; data: Record<string, string>; error: string }[];
    total: number;
  } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "20");
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (brandFilter) params.set("brand_id", brandFilter);
    if (searchQuery) params.set("search", searchQuery);

    api
      .get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`)
      .then((r) => {
        setData(r.data);
      })
      .catch(() => toast.error("পণ্য তালিকা লোড করা যায়নি"))
      .finally(() => setLoading(false));
  }, [page, categoryFilter, statusFilter, brandFilter, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    api
      .get<{ data: Category[] }>("/admin/categories")
      .then((r) => setCategories(r.data.data))
      .catch(() => {});
    api
      .get<PaginatedResponse<Brand>>("/admin/brands?per_page=100")
      .then((r) => setBrands(r.data.data))
      .catch(() => {});
  }, []);

  const handleToggleStatus = async (product: Product) => {
    try {
      const res = await api.patch<{ data: Product }>(`/admin/products/${product.id}/toggle-status`);
      const updatedProduct = res.data.data;
      toast.success(
        updatedProduct.status === "published"
          ? "পণ্যটি ওয়েবসাইটে প্রকাশিত হয়েছে"
          : "পণ্যটি ড্রাফট করা হয়েছে"
      );
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((p) => (p.id === product.id ? updatedProduct : p)),
        };
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে");
    }
  };

  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`);
      toast.success("পণ্যটি সফলভাবে মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleBulkMode = () => {
    setBulkMode((prev) => !prev);
    setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedIds(data.data.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkAction = (action: "delete" | "activate" | "deactivate") => {
    if (selectedIds.length === 0) return;
    if (action === "delete") {
      setShowBulkDeleteConfirm(true);
    } else {
      executeBulkAction(action);
    }
  };

  const executeBulkAction = async (action: "delete" | "activate" | "deactivate") => {
    setIsBulkActionLoading(true);
    try {
      await api.post("/admin/products/bulk-action", {
        ids: selectedIds,
        action,
      });
      if (action === "delete") {
        toast.success(`${selectedIds.length}টি পণ্য মুছে ফেলা হয়েছে`);
        setShowBulkDeleteConfirm(false);
      } else if (action === "activate") {
        toast.success(`${selectedIds.length}টি পণ্য সক্রিয় (Published) করা হয়েছে`);
      } else if (action === "deactivate") {
        toast.success(`${selectedIds.length}টি পণ্য ড্রাফট করা হয়েছে`);
      }
      setSelectedIds([]);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message ?? "বাল্ক অ্যাকশন সম্পন্ন করা যায়নি");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("per_page", "5000");
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (brandFilter) params.set("brand_id", brandFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await api.get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`);
      const exportList = res.data.data;
      if (!exportList || exportList.length === 0) {
        toast.info("এক্সপোর্ট করার মতো কোনো পণ্য পাওয়া যায়নি");
        return;
      }

      const csvData = exportList.map((p, idx) => ({
        "SL": idx + 1,
        "Product Name": p.name,
        "Category": p.category?.name ?? "",
        "Brand": p.brand?.name ?? "",
        "Vendor": p.vendor?.shop_name ?? "",
        "Selling Price": p.price,
        "Sale Price": p.sale_price ?? "",
        "Cost Price": p.cost_price ?? "",
        "Profit": Number(p.sale_price ?? p.price) - Number(p.cost_price ?? 0),
        "Stock Quantity": p.stock_quantity,
        "Status": p.status,
      }));

      const csvString = Papa.unparse(csvData);
      const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `FutureShop_Products_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${exportList.length}টি পণ্যের CSV ডাউনলোড সম্পন্ন হয়েছে`);
    } catch {
      toast.error("CSV এক্সপোর্ট ব্যর্থ হয়েছে");
    } finally {
      setExporting(false);
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
      toast.error("অনুগ্রহ করে Vendor নির্বাচন করুন");
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
      toast.error(err?.response?.data?.message ?? "ইমপোর্ট ব্যর্থ হয়েছে");
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
    <div className="space-y-6">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              পণ্য ব্যবস্থাপনা (Product Catalog)
            </h1>
            {data && (
              <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
                মোট {data.total}টি পণ্য
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            ওয়েবসাইটের সকল পণ্য নিয়ন্ত্রণ, স্টক আপডেট, মূল্য ও বাল্ক আপলোড
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={bulkMode ? "default" : "outline"}
            className={`h-10 px-3.5 rounded-xl text-xs font-bold ${
              bulkMode ? "bg-[#f47920] hover:bg-[#d46212] text-white shadow-xs" : "border-gray-200 text-gray-700"
            }`}
            onClick={toggleBulkMode}
          >
            {bulkMode ? "✓ বাল্ক মোড চালু" : "বাল্ক মোড"}
          </Button>

          <Button
            variant="outline"
            className="h-10 px-3.5 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920]"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            <span>{exporting ? "এক্সপোর্ট হচ্ছে..." : "এক্সেল / CSV এক্সপোর্ট"}</span>
          </Button>

          <Button
            variant="outline"
            className="h-10 px-3.5 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920]"
            onClick={openWizard}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            <span>CSV ইমপোর্ট</span>
          </Button>

          {(() => {
            const qs = getReturnParams();
            return (
              <Button
                nativeButton={false}
                render={<Link href={qs ? `/admin/products/new?${qs}` : "/admin/products/new"} />}
                className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>নতুন পণ্য যোগ করুন</span>
              </Button>
            );
          })()}
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchInput.trim();
            setPage(1);
            setSearchQuery(q);
            updateUrl(1, categoryFilter, statusFilter, brandFilter, q);
          }}
          className="flex items-center gap-1.5 flex-1 min-w-[240px]"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === "") {
                  setSearchQuery("");
                  setPage(1);
                  updateUrl(1, categoryFilter, statusFilter, brandFilter, "");
                }
              }}
              placeholder="পণ্যের নাম বা SKU দিয়ে খুঁজুন..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 text-xs outline-none focus:border-[#f47920] focus:bg-white focus:ring-2 focus:ring-[#f47920]/20 transition-all"
            />
          </div>
          <Button
            type="submit"
            className="h-10 px-4 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-2xs"
          >
            খুঁজুন
          </Button>
        </form>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            const cat = e.target.value;
            setPage(1);
            setCategoryFilter(cat);
            updateUrl(1, cat, statusFilter, brandFilter, searchQuery);
          }}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
        >
          <option value="">সকল ক্যাটাগরি</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => {
            const stat = e.target.value;
            setPage(1);
            setStatusFilter(stat);
            updateUrl(1, categoryFilter, stat, brandFilter, searchQuery);
          }}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
        >
          <option value="">সকল স্ট্যাটাস</option>
          <option value="published">প্রকাশিত (Published)</option>
          <option value="draft">ড্রাফট (Draft)</option>
          <option value="out_of_stock">স্টক নেই (Out of stock)</option>
        </select>

        {/* Brand Dropdown */}
        <select
          value={brandFilter}
          onChange={(e) => {
            const br = e.target.value;
            setPage(1);
            setBrandFilter(br);
            updateUrl(1, categoryFilter, statusFilter, br, searchQuery);
          }}
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
        >
          <option value="">সকল ব্র্যান্ড</option>
          {brands.map((b) => (
            <option key={b.id} value={String(b.id)}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk Action Controls Bar */}
      {bulkMode && selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50/70 p-3.5 shadow-xs">
          <span className="text-xs font-bold text-orange-950">
            {selectedIds.length}টি পণ্য নির্বাচিত হয়েছে
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
              onClick={() => handleBulkAction("delete")}
              disabled={isBulkActionLoading}
            >
              মুছে ফেলুন ({selectedIds.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-green-200 text-green-700 hover:bg-green-50 text-xs font-bold"
              onClick={() => handleBulkAction("activate")}
              disabled={isBulkActionLoading}
            >
              Active / Publish করুন
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold"
              onClick={() => handleBulkAction("deactivate")}
              disabled={isBulkActionLoading}
            >
              Draft করুন
            </Button>
          </div>
        </div>
      )}

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground font-semibold" lang="bn">পণ্য তালিকা লোড হচ্ছে...</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800" lang="bn">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-muted-foreground" lang="bn">অনুগ্রহ করে ফিল্টার পরিবর্তন করুন বা নতুন পণ্য যোগ করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  {bulkMode && (
                    <TableHead className="w-10 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                        checked={data.data.length > 0 && selectedIds.length === data.data.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="Select all"
                      />
                    </TableHead>
                  )}
                  <TableHead className="w-12 font-bold text-xs">#</TableHead>
                  <TableHead className="w-14 font-bold text-xs">ছবি</TableHead>
                  <TableHead className="font-bold text-xs min-w-[200px]">পণ্যের নাম ও ক্যাটাগরি</TableHead>
                  <TableHead className="font-bold text-xs">ব্র্যান্ড</TableHead>
                  <TableHead className="font-bold text-xs">ভেন্ডর</TableHead>
                  <TableHead className="font-bold text-xs">বিক্রয় মূল্য</TableHead>
                  <TableHead className="font-bold text-xs">ক্রয় মূল্য</TableHead>
                  <TableHead className="font-bold text-xs">লাভ (Profit)</TableHead>
                  <TableHead className="font-bold text-xs text-center">স্টক</TableHead>
                  <TableHead className="font-bold text-xs text-center">স্ট্যাটাস</TableHead>
                  <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 text-xs">
                {data.data.map((product, index) => {
                  const img = product.images?.[0]?.url ?? null;
                  const profit = profitFor(product);
                  const isOutOfStock = product.stock_quantity <= 0;
                  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

                  return (
                    <TableRow key={product.id} className="hover:bg-orange-50/20 transition-colors">
                      {bulkMode && (
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                            checked={selectedIds.includes(product.id)}
                            onChange={(e) => handleSelectOne(product.id, e.target.checked)}
                            aria-label={`Select ${product.name}`}
                          />
                        </TableCell>
                      )}

                      <TableCell className="font-mono text-gray-500 font-semibold">
                        {(data.from ?? 1) + index}
                      </TableCell>

                      <TableCell>
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                          {img ? (
                            <Image src={img} alt={product.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ImageOff className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5 min-w-0 max-w-[240px]">
                          <p className="font-bold text-gray-900 truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {product.category?.name ?? "ক্যাটাগরি নেই"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {product.brand?.name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>

                      <TableCell className="text-gray-600">
                        {product.vendor?.shop_name ?? "—"}
                      </TableCell>

                      <TableCell className="font-bold text-gray-900">
                        {formatTaka(Number(product.sale_price ?? product.price))}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {product.cost_price ? formatTaka(Number(product.cost_price)) : "—"}
                      </TableCell>

                      <TableCell>
                        <span className={`font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {profit >= 0 ? "+" : ""}{formatTaka(profit)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        {isOutOfStock ? (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold">
                            স্টক শেষ
                          </Badge>
                        ) : isLowStock ? (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                            {product.stock_quantity}টি (কম)
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                            {product.stock_quantity}টি
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            product.status === "published"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : product.status === "out_of_stock"
                              ? "bg-red-100 text-red-800 hover:bg-red-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {product.status === "published"
                            ? "প্রকাশিত ✓"
                            : product.status === "out_of_stock"
                            ? "স্টক শেষ 🛑"
                            : "ড্রাফট"}
                        </button>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(() => {
                            const qs = getReturnParams();
                            const editUrl = `/admin/products/new?id=${product.id}${qs ? `&${qs}` : ""}`;
                            return (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-gray-600 hover:text-[#f47920] hover:bg-orange-50"
                                nativeButton={false}
                                render={<Link href={editUrl} />}
                                title="এডিট করুন"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            );
                          })()}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(product)}
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <span className="text-xs text-muted-foreground font-semibold" lang="bn">
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total}টি পণ্য)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-bold"
              disabled={page <= 1}
              onClick={() => {
                const newPage = page - 1;
                setPage(newPage);
                updateUrl(newPage, categoryFilter, statusFilter, brandFilter, searchQuery);
              }}
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
                    if (item !== page) {
                      setPage(item);
                      updateUrl(item, categoryFilter, statusFilter, brandFilter, searchQuery);
                    }
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
              onClick={() => {
                const newPage = page + 1;
                setPage(newPage);
                updateUrl(newPage, categoryFilter, statusFilter, brandFilter, searchQuery);
              }}
            >
              <span>পরের পৃষ্ঠা</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* CSV Import Wizard Dialog */}
      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          if (!open) {
            setImportOpen(false);
            setWizardStep(1);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-gray-900" lang="bn">
              {wizardStep === 1 && "ধাপ ১ — এক্সেল বা CSV ফাইল আপলোড করুন"}
              {wizardStep === 2 && "ধাপ ২ — কলাম ম্যাপিং ও ভেন্ডর নির্ধারণ"}
              {wizardStep === 3 && "ধাপ ৩ — ইমপোর্ট ফলাফল"}
            </DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="mb-4 flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= wizardStep ? "bg-[#f47920]" : "bg-gray-100"
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Upload */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground" lang="bn">
                যেকোনো ফরম্যাটের CSV আপলোড করুন। পরের ধাপে আপনি নির্ধারণ করবেন কোন কলাম কোন ফিল্ডে যাবে।
              </p>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center transition-colors hover:border-[#f47920] bg-gray-50/50"
                onClick={() => document.getElementById("csv-wizard-input")?.click()}
              >
                <Upload className="mb-3 h-10 w-10 text-[#f47920]" />
                <p className="text-xs font-bold text-gray-900" lang="bn">
                  CSV ফাইল ড্র্যাগ করুন বা ক্লিক করে সিলেক্ট করুন
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground" lang="bn">
                  .csv ফাইল (সর্বোচ্চ ১০MB)
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

          {/* STEP 2: Column Mapping */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700" lang="bn">
                  ভেন্ডর / সেলার নির্বাচন করুন *
                </label>
                <select
                  value={wizardVendorId}
                  onChange={(e) => setWizardVendorId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700"
                >
                  <option value="" lang="bn">-- ভেন্ডর সিলেক্ট করুন --</option>
                  {wizardVendors.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.shop_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700" lang="bn">
                  কলাম ম্যাপিং
                </label>
                <p className="mb-2 text-[11px] text-muted-foreground" lang="bn">
                  CSV-এর প্রতিটি কলাম ডাটাবেজের কোন ফিল্ডে যাবে তা নির্ধারণ করুন।
                </p>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold" lang="bn">CSV কলাম</th>
                        <th className="px-3 py-2 text-left font-bold" lang="bn">ম্যাপ করুন →</th>
                        <th className="px-3 py-2 text-left font-bold text-muted-foreground" lang="bn">নমুনা মান</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {csvHeaders.map((header) => (
                        <tr key={header}>
                          <td className="px-3 py-2 font-mono text-[11px] text-gray-700">{header}</td>
                          <td className="px-3 py-2">
                            <select
                              value={columnMapping[header] ?? "ignore"}
                              onChange={(e) => {
                                const val = e.target.value;
                                setColumnMapping((prev) => ({
                                  ...prev,
                                  [header]: val,
                                }));
                              }}
                              className="h-8 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs"
                            >
                              {FIELD_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="max-w-[120px] truncate px-3 py-2 text-[11px] text-muted-foreground">
                            {csvRows[0]?.[header] ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground" lang="bn">
                মোট {csvRows.length}টি পণ্য পাওয়া গেছে। পণ্যগুলো ড্রাফট হিসেবে ইমপোর্ট হবে।
              </p>

              <DialogFooter className="gap-2">
                <Button variant="ghost" onClick={() => setWizardStep(1)} className="h-10 rounded-xl text-xs">
                  <span lang="bn">← পেছনে</span>
                </Button>
                <Button
                  onClick={runImport}
                  disabled={importing || !wizardVendorId}
                  className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
                >
                  {importing ? "ইমপোর্ট হচ্ছে..." : `ইমপোর্ট শুরু করুন (${csvRows.length}টি পণ্য)`}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* STEP 3: Result */}
          {wizardStep === 3 && importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4 text-center border border-emerald-100">
                  <p className="text-2xl font-black text-emerald-700">{importResult.success}</p>
                  <p className="mt-0.5 text-xs font-bold text-emerald-600" lang="bn">সফল</p>
                </div>
                <div className="rounded-2xl bg-red-50 p-4 text-center border border-red-100">
                  <p className="text-2xl font-black text-red-700">{importResult.errors.length}</p>
                  <p className="mt-0.5 text-xs font-bold text-red-600" lang="bn">ত্রুটি</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 text-center border border-gray-100">
                  <p className="text-2xl font-black text-gray-900">{importResult.total}</p>
                  <p className="mt-0.5 text-xs font-bold text-muted-foreground" lang="bn">মোট</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setImportOpen(false);
                    setWizardStep(1);
                  }}
                  className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
                >
                  <span lang="bn">সম্পন্ন</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">পণ্যটি মুছে ফেলবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-xs text-muted-foreground leading-relaxed" lang="bn">
            আপনি কি নিশ্চিত যে <strong>{deleteTarget?.name}</strong> মুছে ফেলতে চান? এই অ্যাকশনটি ফিরিয়ে আনা যাবে না।
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setDeleteTarget(null)} variant="ghost" className="h-10 rounded-xl text-xs" disabled={isDeleting}>
              বাতিল
            </Button>
            <Button onClick={confirmDelete} className="h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold" disabled={isDeleting}>
              {isDeleting ? "মুছে ফেলা হচ্ছে..." : "মুছে ফেলুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">নির্বাচিত পণ্যগুলো মুছে ফেলবেন?</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-xs text-muted-foreground leading-relaxed" lang="bn">
            আপনি কি নিশ্চিত? নির্বাচিত <strong>{selectedIds.length}টি</strong> পণ্য স্থায়ীভাবে মুছে যাবে।
          </p>
          <DialogFooter className="gap-2">
            <Button onClick={() => setShowBulkDeleteConfirm(false)} variant="ghost" className="h-10 rounded-xl text-xs" disabled={isBulkActionLoading}>
              বাতিল
            </Button>
            <Button onClick={() => executeBulkAction("delete")} className="h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold" disabled={isBulkActionLoading}>
              {isBulkActionLoading ? "মুছছে..." : "মুছে ফেলুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullHeight />}>
      <AdminProductsContent />
    </Suspense>
  );
}
