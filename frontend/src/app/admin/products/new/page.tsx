"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import type { Brand, Category, PaginatedResponse, Product, Vendor } from "@/types";

const MAX_BYTES = 5 * 1024 * 1024;

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

export default function AdminProductFormPage() {
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // Load dropdowns + (optional) the product being edited.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    const tasks: Promise<unknown>[] = [
      api.get<{ data: Category[] }>("/admin/categories").then((r) => setCategories(r.data.data)),
      api.get<PaginatedResponse<Vendor>>("/admin/vendors?per_page=50").then((r) => setVendors(r.data.data)),
      api.get<PaginatedResponse<Brand>>("/admin/brands?per_page=100").then((r) => setBrands(r.data.data)),
    ];

    if (id) {
      setEditId(Number(id));
      tasks.push(
        api.get<{ data: Product }>(`/admin/products/${id}`).then((r) => {
          const p = r.data.data;
          setName(p.name);
          setDescription(p.description ?? "");
          setPrice(String(p.price));
          setSalePrice(p.sale_price ? String(p.sale_price) : "");
          setCostPrice(p.cost_price ? String(p.cost_price) : "");
          setStock(String(p.stock_quantity));
          setCategoryId(String(p.category_id));
          setVendorId(String(p.vendor_id));
          setBrandId(p.brand_id ? String(p.brand_id) : "");
          setStatus(p.status === "published" ? "published" : "draft");
        }),
      );
    }

    Promise.allSettled(tasks).finally(() => setBootstrapping(false));
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    const tooLarge = files.find((f) => f.size > MAX_BYTES);
    if (tooLarge) {
      toast.error("প্রতিটি ছবি সর্বোচ্চ ৫MB হতে পারে");
      return;
    }
    setImages(files);
  };

  const validate = (): string | null => {
    if (!name.trim()) return "পণ্যের নাম দিন";
    if (!price || Number(price) <= 0) return "সঠিক মূল্য দিন";
    if (salePrice && Number(salePrice) > Number(price)) return "ছাড় মূল্য নিয়মিত মূল্যের বেশি হতে পারে না";
    if (stock === "" || Number(stock) < 0) return "স্টকের পরিমাণ দিন";
    if (!categoryId) return "ক্যাটাগরি নির্বাচন করুন";
    if (!vendorId) return "বিক্রেতা নির্বাচন করুন";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const form = new FormData();
    form.append("name", name);
    form.append("description", description);
    form.append("price", price);
    if (salePrice) form.append("sale_price", salePrice);
    if (costPrice) form.append("cost_price", costPrice);
    form.append("stock_quantity", stock);
    form.append("category_id", categoryId);
    form.append("vendor_id", vendorId);
    if (brandId) form.append("brand_id", brandId);
    form.append("status", status);
    images.forEach((file) => form.append("images[]", file));

    setSaving(true);
    try {
      if (editId) {
        // Method spoofing so multipart works with PUT semantics.
        form.append("_method", "PUT");
        await api.post(`/admin/products/${editId}`, form);
        toast.success("পণ্য আপডেট হয়েছে");
      } else {
        await api.post("/admin/products", form);
        toast.success("পণ্য তৈরি হয়েছে");
      }
      router.push("/admin/products");
    } catch (err) {
      toast.error(getErrorMessage(err, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  if (bootstrapping) return <LoadingSpinner fullHeight />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{editId ? "Edit Product" : "Add Product"}</h1>
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" lang="bn">পণ্যের নাম</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" lang="bn">বিবরণ</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" lang="bn">মূল্য (৳)</Label>
                <Input id="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price" lang="bn">ছাড় মূল্য (৳)</Label>
                <Input id="sale_price" type="number" min="0" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price (৳)</Label>
              <Input
                id="cost_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This is your purchase cost — not shown to customers.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" lang="bn">স্টকের পরিমাণ</Label>
              <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" lang="bn">ক্যাটাগরি</Label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">নির্বাচন করুন</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor" lang="bn">বিক্রেতা</Label>
                <select
                  id="vendor"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">নির্বাচন করুন</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.shop_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">No Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images" lang="bn">ছবি (একাধিক, প্রতিটি সর্বোচ্চ ৫MB)</Label>
              <Input
                id="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
              />
              {images.length > 0 && (
                <p className="text-xs text-muted-foreground">{images.length} টি ছবি নির্বাচিত</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={status === "published"}
                onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
              />
              <span lang="bn">প্রকাশিত (Active)</span>
            </label>

            <Button type="submit" disabled={saving} className="w-full bg-[#f47920] hover:bg-[#e56910]">
              <span lang="bn">{editId ? "আপডেট করুন" : "সংরক্ষণ করুন"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
