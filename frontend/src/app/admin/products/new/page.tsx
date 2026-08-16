"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Layers,
  Sparkles,
  DollarSign,
  Package,
  CheckCircle2,
  FolderTree,
  Tag,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
    const resp = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    const errors = resp?.data?.errors;
    if (errors) {
      return Object.values(errors).flat().join(" ");
    }
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
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [confirmRemoveIndex, setConfirmRemoveIndex] = useState<number | null>(null);
  const [attributes, setAttributes] = useState<{ title: string; value: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Inline Category dialog
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catParentId, setCatParentId] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Inline Brand dialog
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandSaving, setBrandSaving] = useState(false);

  const getReturnUrl = (isEdit: boolean) => {
    const returnParams = new URLSearchParams();
    const page = searchParams.get("page");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const brand_id = searchParams.get("brand_id");
    const search = searchParams.get("search");

    if (isEdit && page) returnParams.set("page", page);
    if (category) returnParams.set("category", category);
    if (status) returnParams.set("status", status);
    if (brand_id) returnParams.set("brand_id", brand_id);
    if (search) returnParams.set("search", search);

    const qs = returnParams.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

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
          setSku(p.sku ?? "");
          setWeight(p.weight ? String(p.weight) : "");
          setPrice(String(p.price));
          setSalePrice(p.sale_price ? String(p.sale_price) : "");
          setCostPrice(p.cost_price ? String(p.cost_price) : "");
          setStock(String(p.stock_quantity));
          setCategoryId(String(p.category_id));
          setVendorId(String(p.vendor_id));
          setBrandId(p.brand_id ? String(p.brand_id) : "");
          setIsFeatured(Boolean(p.is_featured));
          setStatus(p.status === "published" ? "published" : "draft");
          setAttributes(p.attributes ?? []);
          setExistingImages(p.images ?? []);
        }),
      );
    }

    Promise.allSettled(tasks).finally(() => setBootstrapping(false));
  }, [searchParams]);

  const usedImageCount = () =>
    existingImages.length + images.length + imageUrls.filter((u) => u.trim() !== "").length;

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
      toast.warning("সর্বোচ্চ ৫টি ছবি — অতিরিক্তগুলো বাদ পড়েছে");
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

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setConfirmRemoveIndex(null);
  };

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
      toast.success(`${pastedFiles.length}টি ছবি পেস্ট করা হয়েছে`);
      return;
    }

    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
    const text = e.clipboardData.getData("text").trim();
    if (text.startsWith("https://")) {
      if (usedImageCount() >= 5) {
        toast.error("সর্বোচ্চ ৫টি ছবি যোগ করা যাবে");
        return;
      }
      setImageUrls((prev) => [...prev, text]);
      toast.success("ইমেজ URL পেস্ট হয়েছে");
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
    if (!name.trim()) return "অনুগ্রহ করে পণ্যের নাম লিখুন";
    if (!price || Number(price) <= 0) return "সঠিক বিক্রয় মূল্য দিন";
    if (salePrice && Number(salePrice) > Number(price)) return "অফার মূল্য নিয়মিত মূল্যের চেয়ে বেশি হতে পারে না";
    if (stock === "" || Number(stock) < 0) return "স্টকের সঠিক পরিমাণ দিন";
    if (!categoryId) return "ক্যাটাগরি নির্বাচন করুন";
    if (!vendorId) return "ভেন্ডর / বিক্রেতা নির্বাচন করুন";
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
    form.append("name", name.trim());
    form.append("description", description.trim());
    if (sku.trim()) form.append("sku", sku.trim());
    if (weight) form.append("weight", weight);
    form.append("price", price);
    if (salePrice) form.append("sale_price", salePrice);
    if (costPrice) form.append("cost_price", costPrice);
    form.append("stock_quantity", stock);
    form.append("category_id", categoryId);
    form.append("vendor_id", vendorId);
    if (brandId) {
      form.append("brand_id", brandId);
    } else if (editId) {
      form.append("brand_id", "");
    }
    form.append("is_featured", isFeatured ? "1" : "0");
    form.append("status", status);
    images.forEach((file) => form.append("images[]", file));
    
    attributes
      .map((a) => ({ title: a.title.trim(), value: a.value.trim() }))
      .filter((a) => a.title !== "" && a.value !== "")
      .forEach((a, i) => {
        form.append(`attributes[${i}][title]`, a.title);
        form.append(`attributes[${i}][value]`, a.value);
      });

    imageUrls
      .map((u) => u.trim())
      .filter((u) => u.startsWith("https://"))
      .forEach((u) => form.append("image_urls[]", u));

    setSaving(true);
    try {
      if (editId) {
        form.append("_method", "PUT");
        if (existingImages.length > 0) {
          existingImages.forEach((img) => form.append("kept_image_urls[]", img.url));
        } else {
          form.append("kept_image_urls", "");
        }
        await api.post(`/admin/products/${editId}`, form);
        toast.success("পণ্য সফলভাবে আপডেট করা হয়েছে!");
        router.push(getReturnUrl(true));
      } else {
        await api.post("/admin/products", form);
        toast.success("নতুন পণ্য সফলভাবে তৈরি করা হয়েছে!");
        router.push("/admin/products");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "সংরক্ষণ ব্যর্থ হয়েছে"));
    } finally {
      setSaving(false);
    }
  };

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
      setCategoryId(String(created.id));
      setCatDialogOpen(false);
      setCatName("");
      setCatParentId("");
      setCatIcon("");
      toast.success("ক্যাটাগরি তৈরি ও নির্বাচন সম্পন্ন হয়েছে");
    } catch (err) {
      const e = err as {
        response?: { data?: { errors?: Record<string, string[]>; message?: string } };
      };
      const errs = e?.response?.data?.errors;
      toast.error(
        errs
          ? Object.values(errs).flat().join(" ")
          : (e?.response?.data?.message ?? "ক্যাটাগরি তৈরি ব্যর্থ হয়েছে"),
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
      setBrandId(String(created.id));
      setBrandDialogOpen(false);
      setBrandName("");
      toast.success("ব্র্যান্ড তৈরি ও নির্বাচন সম্পন্ন হয়েছে");
    } catch (err) {
      const e = err as {
        response?: { data?: { errors?: Record<string, string[]>; message?: string } };
      };
      const errs = e?.response?.data?.errors;
      toast.error(
        errs
          ? Object.values(errs).flat().join(" ")
          : (e?.response?.data?.message ?? "ব্র্যান্ড তৈরি ব্যর্থ হয়েছে"),
      );
    } finally {
      setBrandSaving(false);
    }
  };

  if (bootstrapping) return <LoadingSpinner fullHeight />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(getReturnUrl(true))}
          className="h-10 px-3.5 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920] shadow-2xs"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          <span>পণ্য তালিকায় ফিরে যান</span>
        </Button>

        <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight" lang="bn">
          {editId ? "পণ্য তথ্য হালনাগাদ (Edit Product)" : "নতুন পণ্য যোগ করুন (Add Product)"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} onPaste={handlePaste} className="space-y-6">
        
        {/* SECTION 1: Basic Information */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Package className="w-4 h-4 text-[#f47920]" />
            <h2 className="text-sm font-extrabold text-gray-900" lang="bn">মৌলিক তথ্য</h2>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold text-gray-700" lang="bn">
              পণ্যের পুরো নাম <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: প্রিমিয়াম সরিষার তেল (১ লিটার)"
              className="h-11 rounded-xl text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs font-bold text-gray-700" lang="bn">
                এসকেইউ কোড (SKU / বারকোড - ঐচ্ছিক)
              </Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="যেমন: OIL-MUST-1L"
                className="h-11 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-xs font-bold text-gray-700" lang="bn">
                পণ্যের ওজন (ওজন কেজি হিসেবে - ঐচ্ছিক)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="যেমন: 1.00"
                className="h-11 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-gray-700" lang="bn">
              পণ্যের বিবরণ ও বৈশিষ্ট্য
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="পণ্যের উপাদান, ব্যবহারের নিয়ম ও বিস্তারিত বিবরণ লিখুন..."
              className="flex w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-xs outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION 2: Category, Brand & Vendor */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <FolderTree className="w-4 h-4 text-[#f47920]" />
            <h2 className="text-sm font-extrabold text-gray-900" lang="bn">ক্যাটাগরি ও বিক্রেতা</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="text-xs font-bold text-gray-700" lang="bn">
                  ক্যাটাগরি <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => setCatDialogOpen(true)}
                  className="text-[11px] font-bold text-[#f47920] hover:underline"
                >
                  + নতুন ক্যাটাগরি
                </button>
              </div>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
                required
              >
                <option value="">নির্বাচন করুন</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Vendor Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="vendor" className="text-xs font-bold text-gray-700" lang="bn">
                ভেন্ডর / সেলার <span className="text-red-500">*</span>
              </Label>
              <select
                id="vendor"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
                required
              >
                <option value="">নির্বাচন করুন</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.shop_name}</option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="brand" className="text-xs font-bold text-gray-700" lang="bn">
                  ব্র্যান্ড (ঐচ্ছিক)
                </Label>
                <button
                  type="button"
                  onClick={() => setBrandDialogOpen(true)}
                  className="text-[11px] font-bold text-[#f47920] hover:underline"
                >
                  + নতুন ব্র্যান্ড
                </button>
              </div>
              <select
                id="brand"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#f47920]"
              >
                <option value="">কোনো ব্র্যান্ড নেই (General)</option>
                {brands.map((b) => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* SECTION 3: Pricing & Stock */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-gray-900" lang="bn">মূল্য ও স্টক পরিমাণ</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-bold text-gray-700" lang="bn">
                নিয়মিত বিক্রয় মূল্য (MRP ৳) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sale_price" className="text-xs font-bold text-gray-700" lang="bn">
                অফার / ডিসকাউন্ট মূল্য (Sale Price ৳)
              </Label>
              <Input
                id="sale_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00 (ছাড় না থাকলে ফাঁকা রাখুন)"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="h-11 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cost_price" className="text-xs font-bold text-gray-700" lang="bn">
                ক্রয় / পাইকারি খরচ (Cost Price ৳)
              </Label>
              <Input
                id="cost_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="h-11 rounded-xl text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                * এটি কেবল অ্যাডমিনের লাভ হিসাবের জন্য, কাস্টমার দেখবে না।
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stock" className="text-xs font-bold text-gray-700" lang="bn">
                স্টকের পরিমাণ (Quantity) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="যেমন: 50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="h-11 rounded-xl text-xs font-mono"
                required
              />
            </div>

          </div>
        </div>

        {/* SECTION 4: Product Images (Max 5) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#f47920]" />
              <h2 className="text-sm font-extrabold text-gray-900" lang="bn">
                পণ্যের ছবি (সর্বোচ্চ ৫টি)
              </h2>
            </div>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 text-xs font-bold">
              {usedImageCount()}/৫টি
            </Badge>
          </div>

          {/* Existing Saved Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700">সংরক্ষিত ছবিসমূহ:</p>
              <div className="flex flex-wrap gap-2.5">
                {existingImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-50 shadow-2xs"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {confirmRemoveIndex === index ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/80 p-1 text-center">
                        <span className="text-[10px] font-bold text-white">মুছবেন?</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="rounded-md bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white"
                          >
                            হ্যাঁ
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveIndex(null)}
                            className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold text-gray-800"
                          >
                            না
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveIndex(index)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Trigger */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-xs font-bold text-gray-700" lang="bn">
              ডিভাইস থেকে নতুন ছবি নির্বাচন করুন (বা ড্র্যাগ ও Ctrl+V পেস্ট করুন)
            </Label>
            <Input
              id="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="h-11 rounded-xl text-xs"
              onChange={(e) => {
                appendFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {images.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs"
                  >
                    <span className="max-w-[140px] truncate font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Online Image URLs */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <Label className="text-xs font-bold text-gray-700" lang="bn">
              অনলাইন ছবি লিঙ্ক (HTTPS Image URL)
            </Label>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://yoursite.com/image.jpg"
                  value={url}
                  onChange={(e) => updateUrl(index, e.target.value)}
                  className="h-10 rounded-xl text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeUrl(index)}
                  className="h-10 w-10 p-0 text-red-500 hover:text-red-700 rounded-xl"
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
              className="h-10 px-4 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920] w-full"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>URL লিঙ্ক দিয়ে ছবি যোগ করুন</span>
            </Button>
          </div>
        </div>

        {/* SECTION 5: Attributes & Specifications */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f47920]" />
              <h2 className="text-sm font-extrabold text-gray-900" lang="bn">
                অতিরিক্ত বৈশিষ্ট্য ও স্পেসিফিকেশন
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">{attributes.length}/২০টি</span>
          </div>

          {attributes.length === 0 ? (
            <p className="text-xs text-muted-foreground" lang="bn">
              যেমন: ওজন → ১ কেজি, কালার → লাল, সাইজ → XL (ক্রেতাদের বিস্তারিত জানানোর জন্য)।
            </p>
          ) : (
            <div className="space-y-2.5">
              {attributes.map((attr, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="বৈশিষ্ট্য (যেমন: ওজন)"
                    value={attr.title}
                    maxLength={60}
                    onChange={(e) => updateAttribute(index, "title", e.target.value)}
                    className="h-10 rounded-xl text-xs flex-1"
                  />
                  <Input
                    placeholder="মান (যেমন: ১ কেজি)"
                    value={attr.value}
                    maxLength={255}
                    onChange={(e) => updateAttribute(index, "value", e.target.value)}
                    className="h-10 rounded-xl text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeAttribute(index)}
                    className="h-10 w-10 p-0 text-red-500 hover:text-red-700 rounded-xl shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addAttribute}
            disabled={attributes.length >= 20}
            className="h-10 px-4 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:text-[#f47920] w-full"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>নতুন বৈশিষ্ট্য যোগ করুন</span>
          </Button>
        </div>

        {/* SECTION 6: Featured & Status & Submit */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
            
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                checked={status === "published"}
                onChange={(e) => setStatus(e.target.checked ? "published" : "draft")}
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block" lang="bn">
                  ওয়েবসাইটে প্রকাশিত (Active / Published)
                </span>
                <span className="text-[11px] text-muted-foreground block" lang="bn">
                  টিক তুলে দিলে পণ্যটি ড্রাফট (Draft) থাকবে
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-[#f47920] focus:ring-[#f47920]"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <div>
                <span className="text-xs font-bold text-gray-900 block flex items-center gap-1" lang="bn">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  ফিচার্ড পণ্য (Featured Product)
                </span>
                <span className="text-[11px] text-muted-foreground block" lang="bn">
                  হোমপেজের ফিচার্ড সেকশনে অগ্রাধিকার পাবে
                </span>
              </div>
            </label>

          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="h-12 px-8 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "সংরক্ষণ হচ্ছে..." : editId ? "পণ্য আপডেট করুন" : "পণ্য সংরক্ষণ করুন"}</span>
            </Button>
          </div>
        </div>

      </form>

      {/* Inline Create Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">নতুন ক্যাটাগরি তৈরি</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                ক্যাটাগরির নাম <span className="text-red-500">*</span>
              </label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="যেমন: ডেইরি ও ডিম"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">প্যারেন্ট ক্যাটাগরি</label>
              <select
                value={catParentId}
                onChange={(e) => setCatParentId(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700"
              >
                <option value="">— টপ-লেভেল ক্যাটাগরি —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={catSaving}
              onClick={() => setCatDialogOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold"
              disabled={catSaving}
              onClick={handleCreateCategory}
            >
              {catSaving ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inline Create Brand Dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">নতুন ব্র্যান্ড তৈরি</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                ব্র্যান্ডের নাম <span className="text-red-500">*</span>
              </label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="যেমন: Radhuni"
                className="h-10 rounded-xl text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={brandSaving}
              onClick={() => setBrandDialogOpen(false)}
            >
              বাতিল
            </Button>
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold"
              disabled={brandSaving}
              onClick={handleCreateBrand}
            >
              {brandSaving ? "তৈরি হচ্ছে..." : "তৈরি করুন"}
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
