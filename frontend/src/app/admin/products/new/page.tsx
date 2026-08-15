"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import type { Brand, Category, PaginatedResponse, Product, ProductImage, Vendor } from "@/types";

const MAX_BYTES = 5 * 1024 * 1024;

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? fallback;
  }
  return fallback;
}

function AdminProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  // Already-saved images (edit mode) — shown read-only; new uploads/URLs append.
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  // New external https image URLs to attach (option ক).
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  // Two-step inline confirm for removing an already-saved image (edit mode).
  const [confirmRemoveIndex, setConfirmRemoveIndex] = useState<number | null>(null);
  // Display-only Title:Value detail pairs (capped at 20 to match the server).
  const [attributes, setAttributes] = useState<{ title: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Inline "+ নতুন category" mini-dialog.
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catParentId, setCatParentId] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Inline "+ নতুন brand" mini-dialog.
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandSaving, setBrandSaving] = useState(false);

  // Helper to compute return URL preserving page and active filters
  const getReturnUrl = (isEdit: boolean) => {
    const returnParams = new URLSearchParams();
    const page = searchParams.get("page");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const brand_id = searchParams.get("brand_id");
    const search = searchParams.get("search");

    if (isEdit && page) {
      returnParams.set("page", page);
    }
    if (category) returnParams.set("category", category);
    if (status) returnParams.set("status", status);
    if (brand_id) returnParams.set("brand_id", brand_id);
    if (search) returnParams.set("search", search);

    const qs = returnParams.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  // Load dropdowns + (optional) the product being edited.
  useEffect(() => {
    const id = searchParams.get("id");
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
          setAttributes(p.attributes ?? []);
          setExistingImages(p.images ?? []);
        }),
      );
    }

    Promise.allSettled(tasks).finally(() => setBootstrapping(false));
  }, []);

  // Images already counted toward the 5-image cap (existing + new files + filled URLs).
  const usedImageCount = () =>
    existingImages.length + images.length + imageUrls.filter((u) => u.trim() !== "").length;

  // Append new files (browse or paste): per-file size guard + 5-image cap.
  const appendFiles = (incoming: File[]) => {
    if (incoming.length === 0) return;
    if (incoming.some((f) => f.size > MAX_BYTES)) {
      toast.error("প্রতিটি ছবি সর্বোচ্চ ৫MB হতে পারে");
      return;
    }
    const slots = 5 - usedImageCount();
    if (slots <= 0) {
      toast.error("সর্বোচ্চ ৫টি ছবি যোগ করা যাবে");
      return;
    }
    const accepted = incoming.slice(0, slots);
    if (accepted.length < incoming.length) {
      toast.warning("সর্বোচ্চ ৫টি ছবি — কিছু বাদ পড়েছে");
    }
    setImages((prev) => [...prev, ...accepted]);
  };

  const removeNewFile = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addUrl = () => {
    if (usedImageCount() >= 5) {
      toast.error("সর্বোচ্চ ৫টি ছবি যোগ করা যাবে");
      return;
    }
    setImageUrls((prev) => [...prev, ""]);
  };

  const updateUrl = (index: number, val: string) => {
    setImageUrls((prev) => prev.map((u, i) => (i === index ? val : u)));
  };

  const removeUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove an already-saved image from the keep-set. It is only actually deleted
  // (DB + storage file) when the form is saved — the two-step confirm guards that.
  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setConfirmRemoveIndex(null);
  };

  // Paste on the form: image files → upload list; a bare https image URL → URL list.
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      appendFiles(pastedFiles);
      toast.success(`${pastedFiles.length}টি ছবি পেস্ট হয়েছে`);
      return;
    }

    // Text URL: only auto-add when not pasting into a text field (let inputs keep their own paste).
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
    const text = e.clipboardData.getData("text").trim();
    if (text.startsWith("https://")) {
      if (usedImageCount() >= 5) {
        toast.error("সর্বোচ্চ ৫টি ছবি যোগ করা যাবে");
        return;
      }
      setImageUrls((prev) => [...prev, text]);
      toast.success("URL পেস্ট হয়েছে");
    }
  };

  const addAttribute = () => {
    if (attributes.length >= 20) return;
    setAttributes((prev) => [...prev, { title: "", value: "" }]);
  };

  const updateAttribute = (index: number, field: "title" | "value", val: string) => {
    setAttributes((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: val } : a)));
  };

  const removeAttribute = (index: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
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
    // Only send rows where both title and value are filled; re-index sequentially.
    attributes
      .map((a) => ({ title: a.title.trim(), value: a.value.trim() }))
      .filter((a) => a.title !== "" && a.value !== "")
      .forEach((a, i) => {
        form.append(`attributes[${i}][title]`, a.title);
        form.append(`attributes[${i}][value]`, a.value);
      });
    // External image URLs — https only; server caps file+url to 5 total.
    imageUrls
      .map((u) => u.trim())
      .filter((u) => u.startsWith("https://"))
      .forEach((u) => form.append("image_urls[]", u));

    setSaving(true);
    try {
      if (editId) {
        // Method spoofing so multipart works with PUT semantics.
        form.append("_method", "PUT");
        // Declare which existing images to keep — others are removed and their
        // files deleted server-side. Empty marker = remove all existing images.
        if (existingImages.length > 0) {
          existingImages.forEach((img) => form.append("kept_image_urls[]", img.url));
        } else {
          form.append("kept_image_urls", "");
        }
        await api.post(`/admin/products/${editId}`, form);
        toast.success("পণ্য আপডেট হয়েছে");
        router.push(getReturnUrl(true));
      } else {
        await api.post("/admin/products", form);
        toast.success("পণ্য তৈরি হয়েছে");
        router.push("/admin/products");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

  // Re-fetch the category list (same endpoint as the initial load) so a freshly
  // created category shows up in the dropdown.
  const refetchCategories = async (): Promise<Category[]> => {
    const r = await api.get<{ data: Category[] }>("/admin/categories");
    setCategories(r.data.data);
    return r.data.data;
  };

  const handleCreateCategory = async () => {
    if (!catName.trim()) {
      toast.error("ক্যাটাগরির নাম দিন");
      return;
    }
    setCatSaving(true);
    try {
      const res = await api.post<{ data: Category }>("/admin/categories", {
        name: catName.trim(),
        parent_id: catParentId ? Number(catParentId) : null,
        icon: catIcon.trim() || null,
      });
      const created = res.data.data;
      await refetchCategories();
      setCategoryId(String(created.id)); // auto-select the new category
      setCatDialogOpen(false);
      setCatName("");
      setCatParentId("");
      setCatIcon("");
      toast.success("ক্যাটাগরি যোগ হয়েছে");
    } catch (err) {
      // Keep the dialog open on error (e.g. 422 duplicate name) so the user can fix it.
      const e = err as {
        response?: { data?: { errors?: Record<string, string[]>; message?: string } };
      };
      const errs = e?.response?.data?.errors;
      toast.error(
        errs
          ? Object.values(errs).flat().join(" ")
          : (e?.response?.data?.message ?? "ক্যাটাগরি যোগ ব্যর্থ হয়েছে"),
      );
    } finally {
      setCatSaving(false);
    }
  };

  const refetchBrands = async (): Promise<Brand[]> => {
    const r = await api.get<PaginatedResponse<Brand>>("/admin/brands?per_page=100");
    setBrands(r.data.data);
    return r.data.data;
  };

  const handleCreateBrand = async () => {
    if (!brandName.trim()) {
      toast.error("ব্র্যান্ডের নাম দিন");
      return;
    }
    setBrandSaving(true);
    try {
      const res = await api.post<{ data: Brand }>("/admin/brands", {
        name: brandName.trim(),
      });
      const created = res.data.data;
      await refetchBrands();
      setBrandId(String(created.id)); // auto-select the new brand
      setBrandDialogOpen(false);
      setBrandName("");
      toast.success("ব্র্যান্ড যোগ হয়েছে");
    } catch (err) {
      const e = err as {
        response?: { data?: { errors?: Record<string, string[]>; message?: string } };
      };
      const errs = e?.response?.data?.errors;
      toast.error(
        errs
          ? Object.values(errs).flat().join(" ")
          : (e?.response?.data?.message ?? "ব্র্যান্ড যোগ ব্যর্থ হয়েছে"),
      );
    } finally {
      setBrandSaving(false);
    }
  };

  if (bootstrapping) return <LoadingSpinner fullHeight />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(getReturnUrl(true))}
          className="h-11"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span lang="bn">ফিরে যান</span>
        </Button>
        <h1 className="text-2xl font-bold">{editId ? "Edit Product" : "Add Product"}</h1>
      </div>
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} onPaste={handlePaste} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="category" lang="bn">ক্যাটাগরি</Label>
                  <button
                    type="button"
                    onClick={() => setCatDialogOpen(true)}
                    className="text-xs font-medium text-[#f47920] hover:underline"
                  >
                    + নতুন
                  </button>
                </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="brand">Brand</Label>
                <button
                  type="button"
                  onClick={() => setBrandDialogOpen(true)}
                  className="text-xs font-medium text-[#f47920] hover:underline"
                >
                  + নতুন
                </button>
              </div>
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

            {/* Extra display-only details (Title:Value). Not variants. */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label lang="bn">আরও তথ্য (Attributes)</Label>
                <span className="text-xs text-muted-foreground">{attributes.length}/20</span>
              </div>

              {attributes.length === 0 && (
                <p className="text-xs text-muted-foreground" lang="bn">
                  যেমন: Flavour → Lemon, Size → 1kg। শুধু দেখানোর জন্য, দামে প্রভাব নেই।
                </p>
              )}

              {attributes.map((attr, index) => (
                <div key={index} className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    aria-label={`Title ${index + 1}`}
                    placeholder="Flavour"
                    value={attr.title}
                    maxLength={60}
                    onChange={(e) => updateAttribute(index, "title", e.target.value)}
                    className="sm:flex-1"
                  />
                  <Input
                    aria-label={`Value ${index + 1}`}
                    placeholder="Lemon"
                    value={attr.value}
                    maxLength={255}
                    onChange={(e) => updateAttribute(index, "value", e.target.value)}
                    className="sm:flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeAttribute(index)}
                    aria-label={`Remove detail ${index + 1}`}
                    className="h-11 w-11 shrink-0 self-end p-0 text-red-500 hover:text-red-700 sm:self-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAttribute}
                disabled={attributes.length >= 20}
                className="h-11 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span lang="bn">আরও তথ্য যোগ করুন</span>
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label lang="bn">ছবি (সর্বোচ্চ ৫টি, প্রতিটি ৫MB)</Label>
                <span className="text-xs text-muted-foreground">{usedImageCount()}/5</span>
              </div>

              {/* Existing images (edit mode) — each can be removed (applied on save). */}
              {existingImages.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted"
                      >
                        {/* admin preview — plain img avoids next/image remotePattern limits */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={`ছবি ${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                        {img.disk === "external" && (
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 text-center text-[9px] text-white">
                            URL
                          </span>
                        )}

                        {confirmRemoveIndex === index ? (
                          // Two-step confirm overlay
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 p-1">
                            <span className="text-[9px] font-medium text-white" lang="bn">
                              মুছবেন?
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                aria-label="Confirm remove"
                                className="rounded bg-red-600 px-1.5 text-[10px] text-white hover:bg-red-700"
                              >
                                হ্যাঁ
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmRemoveIndex(null)}
                                aria-label="Cancel remove"
                                className="rounded bg-white/90 px-1.5 text-[10px] text-gray-800 hover:bg-white"
                              >
                                না
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveIndex(index)}
                            aria-label={`Remove image ${index + 1}`}
                            className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-amber-600" lang="bn">
                    মুছে ফেলা ছবি <strong>সেভ করলে</strong> স্থায়ীভাবে চলে যাবে।
                  </p>
                </div>
              )}

              {/* New file uploads (browse) — paste also adds here */}
              <Input
                id="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  appendFiles(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs"
                    >
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        aria-label={`Remove file ${index + 1}`}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground" lang="bn">
                স্ক্রিনশট/কপি করা ছবি এই ফর্মে <strong>পেস্ট</strong> (Ctrl+V) করেও যোগ করা যায়।
              </p>

              {/* URL-based images (https only) */}
              <div className="space-y-2">
                <Label lang="bn">URL দিয়ে image যোগ করুন (শুধু https)</Label>
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="url"
                      inputMode="url"
                      placeholder="https://yoursite.com/image.jpg"
                      value={url}
                      maxLength={2048}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeUrl(index)}
                      aria-label={`Remove URL ${index + 1}`}
                      className="h-11 w-11 shrink-0 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addUrl}
                  disabled={usedImageCount() >= 5}
                  className="h-11 w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span lang="bn">URL যোগ করুন</span>
                </Button>
              </div>
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

      {/* Inline create-category dialog — essential fields only. */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন ক্যাটাগরি</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                নাম <span className="text-red-500">*</span>
              </label>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="যেমন: ইলেকট্রনিক্স"
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">প্যারেন্ট ক্যাটাগরি</label>
              <select
                value={catParentId}
                onChange={(e) => setCatParentId(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— কোনোটি নয় (টপ-লেভেল) —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">আইকন (ইমোজি)</label>
              <input
                value={catIcon}
                onChange={(e) => setCatIcon(e.target.value)}
                placeholder="যেমন: 🛒"
                maxLength={16}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              disabled={catSaving}
              onClick={() => setCatDialogOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
              disabled={catSaving}
              onClick={handleCreateCategory}
            >
              {catSaving ? "সংরক্ষণ হচ্ছে..." : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline create-brand dialog — essential fields only. */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>নতুন ব্র্যান্ড</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                নাম <span className="text-red-500">*</span>
              </label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="যেমন: Samsung"
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-11"
              disabled={brandSaving}
              onClick={() => setBrandDialogOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              className="h-11 bg-[#f47920] hover:bg-[#e56910]"
              disabled={brandSaving}
              onClick={handleCreateBrand}
            >
              {brandSaving ? "সংরক্ষণ হচ্ছে..." : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminProductFormPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullHeight />}>
      <AdminProductFormContent />
    </Suspense>
  );
}
