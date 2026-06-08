"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, ImageOff, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AdminProductsPage() {
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // CSV import modal state.
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: { row: number; name?: string; errors?: string[]; message?: string }[];
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
    api
      .get<PaginatedResponse<Product>>(`/admin/products?${params.toString()}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [page, categoryFilter, statusFilter, brandFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      toast.success("Product deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get("/admin/products/import-template", { responseType: "blob" });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "products-import-template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Choose a CSV file");
      return;
    }
    setImporting(true);
    setImportResult(null);
    const form = new FormData();
    form.append("file", importFile);
    try {
      const res = await api.post<{
        imported: number;
        skipped: number;
        errors: { row: number; name?: string; errors?: string[]; message?: string }[];
      }>("/admin/products/import", form);
      setImportResult(res.data);
      if (res.data.imported > 0) {
        toast.success(`${res.data.imported} products imported, ${res.data.skipped} skipped`);
        load();
      } else {
        toast.warning(`No products imported (${res.data.skipped} skipped)`);
      }
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Import failed";
      toast.error(msg);
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
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              setImportFile(null);
              setImportResult(null);
              setImportOpen(true);
            }}
          >
            <Upload className="mr-2 h-4 w-4" /> Import CSV
          </Button>
          <Button nativeButton={false} render={<Link href="/admin/products/new" />} className="h-11 bg-[#f47920] hover:bg-[#e56910]">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
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
                {data.data.map((product) => {
                  const img = product.images?.[0]?.url ?? null;
                  return (
                    <TableRow key={product.id}>
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
                        <Badge variant="outline">{product.status}</Badge>
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

      {/* CSV Import modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Button variant="outline" className="h-11 w-full" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Required columns: <code>name, price, cost_price, stock_qty, category_slug</code>.
                Optional: <code>description, sale_price</code>.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">CSV file</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="mt-1 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {importFile && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Selected: {importFile.name} ({Math.round(importFile.size / 1024)} KB)
                </p>
              )}
            </div>

            {importResult && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">
                  <span className="text-green-700">{importResult.imported} imported</span>
                  {", "}
                  <span className="text-red-600">{importResult.skipped} skipped</span>
                </p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Errors
                    </p>
                    <ul className="space-y-1 text-xs">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700">
                          Row {err.row}
                          {err.name ? ` — ${err.name}` : ""}: {(err.errors ?? [err.message ?? "error"]).join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setImportOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || !importFile}
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
            >
              <Upload className="mr-2 h-4 w-4" />
              {importing ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
