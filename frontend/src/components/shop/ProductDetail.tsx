"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
  Check,
  Truck,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";
import type { Product, ProductImage } from "@/types";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const TK = "৳";
const formatTk = (value: number) => `${TK}${value.toLocaleString("en-US")}`;

interface ReviewItem {
  id?: number;
  name: string;
  rating: number;
  title: string;
  created_at?: string;
  is_verified_purchase?: boolean;
  content: string;
}

interface QAItem {
  id?: number;
  name: string;
  question: string;
  answer: string;
  is_answered: boolean;
}

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [qaSearch, setQaSearch] = useState("");

  // Review states
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewContent, setNewReviewContent] = useState("");

  // QA states
  const [qas, setQas] = useState<QAItem[]>([]);
  const [newQA, setNewQA] = useState("");

  useEffect(() => {
    // Fetch real reviews and QAs
    if (product?.id) {
      api.get(`/products/${product.id}/reviews`).then((res) => {
        setReviews(res.data.data || []);
      }).catch(console.error);

      api.get(`/products/${product.id}/qa`).then((res) => {
        setQas(res.data.data || []);
      }).catch(console.error);
    }
  }, [product?.id]);

  const price = Number(product.price);
  const salePrice = product.sale_price !== null ? Number(product.sale_price) : null;
  const hasSale = salePrice !== null && salePrice < price;
  const effectivePrice = hasSale && salePrice !== null ? salePrice : price;
  const discountPct =
    hasSale && salePrice !== null ? Math.round(((price - salePrice) / price) * 100) : 0;

  const outOfStock = product.status === "out_of_stock" || product.stock_quantity <= 0;
  const isExternalSvg = (img: ProductImage) =>
    img.disk === "external" && /\.svg(\?|#|$)/i.test(img.url);
  const images = (product.images ?? []).filter((img) => img && img.url && !isExternalSvg(img));
  const hasImages = images.length > 0;
  const isGallery = images.length > 1;

  const isGrocery = (() => {
    const cat = (product.category?.name || "").toLowerCase();
    const nm = product.name.toLowerCase();
    return (
      cat.includes("grocery") ||
      cat.includes("food") ||
      cat.includes("cooking") ||
      cat.includes("তেল") ||
      cat.includes("চাল") ||
      cat.includes("ডাল") ||
      cat.includes("মসলা") ||
      cat.includes("কাঁচাবাজার") ||
      cat.includes("মুদি") ||
      nm.includes("oil") ||
      nm.includes("তেল") ||
      nm.includes("mustard") ||
      nm.includes("rice") ||
      nm.includes("সরিষা") ||
      nm.includes("চাল") ||
      nm.includes("ডাল") ||
      nm.includes("মসলা") ||
      nm.includes("মুদি")
    );
  })();

  const changeQty = (delta: number) => {
    setQuantity((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (next > product.stock_quantity) return product.stock_quantity;
      return next;
    });
  };

  const handleAddToCart = (redirect = false) => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      quantity,
      image: images[0]?.url,
      stock: product.stock_quantity,
      isGrocery,
      categorySlug: product.category?.slug,
    });
    if (redirect) {
      router.push("/cart");
    } else {
      toast.success("কার্টে যোগ হয়েছে", { description: product.name });
    }
  };

  // Handle new review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewTitle.trim() || !newReviewContent.trim()) {
      toast.error("অনুগ্রহ করে সব তথ্য পূরণ করুন।");
      return;
    }

    try {
      const res = await api.post(`/products/${product.id}/reviews`, {
        name: newReviewName,
        rating: newReviewRating,
        title: newReviewTitle,
        content: newReviewContent,
      });
      
      setReviews([res.data.data, ...reviews]);
      toast.success("Review submitted successfully!");
      setNewReviewName("");
      setNewReviewTitle("");
      setNewReviewContent("");
      setNewReviewRating(5);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  const handleSubmitQA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQA.trim()) return;
    try {
      const res = await api.post(`/products/${product.id}/qa`, {
        question: newQA,
      });
      setQas([res.data.data, ...qas]);
      setNewQA("");
      toast.success("Question submitted successfully!");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to submit question");
    }
  };

  const filteredQAs = qas.filter(item =>
    item.question.toLowerCase().includes(qaSearch.toLowerCase()) ||
    (item.answer && item.answer.toLowerCase().includes(qaSearch.toLowerCase()))
  );

  // Dynamic Rating calculations
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, pct };
  });

  // Dynamic Comparison logic depending on product category/name
  const getComparisonData = () => {
    const catName = (product.category?.name || "").toLowerCase();
    const prodName = product.name.toLowerCase();

    const isTech = catName.includes("stand") || catName.includes("laptop") || catName.includes("mobile") || catName.includes("accessory") || catName.includes("tech") || prodName.includes("stand") || prodName.includes("holder");
    const isOil = catName.includes("oil") || catName.includes("grocer") || catName.includes("food") || prodName.includes("oil") || prodName.includes("মাস্টার্ড") || prodName.includes("সরিষা") || prodName.includes("তেল");

    if (isOil) {
      return {
        columns: [
          { label: product.name + " (Current)", price: formatTk(effectivePrice), attr1: "100% Pure (Ghani)", attr2: "Sherpur (Home Delivery)" },
          { label: "Radhuni Mustard Oil - 250ml", price: "৳110", attr1: "100% Pure Mustard Oil", attr2: "2-4 Days (Courier)" },
          { label: "Pran Mustard Oil - 500ml", price: "৳220", attr1: "100% Pure Mustard Oil", attr2: "Sherpur Home Delivery" }
        ],
        features: [
          { title: "Purity" },
          { title: "Delivery Method" }
        ]
      };
    }

    if (isTech) {
      return {
        columns: [
          { label: product.name + " (Current)", price: formatTk(effectivePrice), attr1: "Aluminum & Silicon", attr2: "Sherpur (Home Delivery)" },
          { label: "Laptop Stand Model-S", price: "৳1,850", attr1: "Plastic & Aluminum", attr2: "Courier Office Delivery Only" },
          { label: "Aluminum Stand Pro", price: "৳2,400", attr1: "Premium Aluminum", attr2: "Sherpur (Home Delivery)" }
        ],
        features: [
          { title: "Material" },
          { title: "Delivery Area" }
        ]
      };
    }

    // General fallback comparison data
    return {
      columns: [
        { label: product.name + " (Current)", price: formatTk(effectivePrice), attr1: "Official Quality", attr2: "Sherpur (Home Delivery)" },
        { label: "Alternative Brand A", price: formatTk(Math.round(effectivePrice * 0.9)), attr1: "Standard Quality", attr2: "3-4 Days (Courier)" },
        { label: "Premium Alternative B", price: formatTk(Math.round(effectivePrice * 1.25)), attr1: "Premium Quality", attr2: "Sherpur (Home Delivery)" }
      ],
      features: [
        { title: "Quality Grade" },
        { title: "Delivery Area" }
      ]
    };
  };

  const comparisonData = getComparisonData();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          ...(product.category
            ? [{ label: product.category.name, url: `/category/${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />
      {/* 3-Column Layout Block */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Column 1: Image Gallery (5 cols on Desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Desktop Vertical Thumbnails Strip (Left) */}
            {isGallery && (
              <div className="hidden md:flex flex-col gap-2 w-20 shrink-0 max-h-[450px] overflow-y-auto pr-1 select-none">
                {images.map((image, index) => (
                  <button
                    key={image.path ?? image.url}
                    onClick={() => setActiveImgIndex(index)}
                    className={`relative aspect-square w-full overflow-hidden rounded-md border-2 bg-white transition-all ${
                      activeImgIndex === index
                        ? "border-[#f47920] ring-1 ring-[#f47920]"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                      unoptimized={image.disk === "external"}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Display (Right) */}
            <div className="relative flex-1 aspect-square w-full overflow-hidden rounded-xl border bg-white shadow-sm min-h-[300px] md:min-h-[450px]">
              {!hasImages ? (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12" />
                  <span className="text-sm" lang="bn">কোনো ছবি নেই</span>
                </div>
              ) : (
                /* Desktop View: Single Active Preview / Mobile View: Swiper */
                <>
                  {/* Desktop Preview */}
                  <div className="hidden md:block relative w-full h-full p-4">
                    <Image
                      src={images[activeImgIndex]?.url || images[0].url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-2"
                      priority
                      unoptimized={images[activeImgIndex]?.disk === "external" || images[0].disk === "external"}
                    />
                  </div>

                  {/* Mobile Touch Swiper */}
                  <div className="block md:hidden w-full h-full">
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true }}
                      spaceBetween={10}
                      className="w-full h-full"
                    >
                      {images.map((image, index) => (
                        <SwiperSlide key={image.path ?? image.url}>
                          <div className="relative w-full h-full p-4">
                            <Image
                              src={image.url}
                              alt={`${product.name} ${index + 1}`}
                              fill
                              sizes="100vw"
                              className="object-contain p-2"
                              priority={index === 0}
                              unoptimized={image.disk === "external"}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Product Info & Description (4 cols on Desktop) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#f47920] uppercase tracking-wider" lang="bn">
              Future Shop
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl leading-snug">
              {product.name}
            </h1>
            
            {/* Star Ratings Summary */}
            <div className="flex items-center gap-1.5 pt-1 select-none">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#f47920] hover:underline cursor-pointer">
                {totalReviews} Ratings
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer">
                3 Q&As
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Pricing & Discount */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              {discountPct > 0 && (
                <span className="text-3xl font-light text-red-500">-{discountPct}%</span>
              )}
              <span className="text-3xl font-extrabold text-slate-950">
                {formatTk(effectivePrice)}
              </span>
            </div>
            {hasSale && (
              <p className="text-xs text-slate-500">
                <span>Original Price:</span>{" "}
                <span className="line-through">{formatTk(price)}</span>
              </p>
            )}
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Check className="h-3 w-3 text-green-600" />
              <span>Best Price Guaranteed</span>
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Key Attributes (Specifications) */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Specifications & Details
              </h3>
              <div className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50/50">
                <dl className="divide-y divide-slate-100">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 px-4 py-2.5 text-xs">
                      <dt className="font-semibold text-slate-500">{attr.title}</dt>
                      <dd className="col-span-2 text-slate-800 font-medium">{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Product Bullet Features */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Features & Description
            </h3>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <li>100% Genuine and Official Product Guarantee.</li>
              <li>Fast home delivery in Bogura, Sherpur.</li>
              <li>Cash on Delivery (COD) payment upon receiving the product.</li>
              {product.description && (
                <li className="list-none -ml-5 whitespace-pre-line text-slate-600 pt-2">
                  {product.description}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Column 3: Buy Box (3 cols on Desktop - Sticky) */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-slate-950">{formatTk(effectivePrice)}</p>
              <p className="text-xs text-green-700 font-semibold">
                Check cart for free delivery
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Truck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {isGrocery ? "Sherpur Delivery Only" : "All Bangladesh Delivery"}
                  </p>
                  <p className="text-[11px]">
                    {isGrocery 
                      ? "Home delivery in Bogura, Sherpur within 2-3 days." 
                      : "Courier/Home delivery nationwide within 2-4 days."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Cash on Delivery (COD)</p>
                  <p className="text-[11px]">Pay after checking the product.</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Stock status & Qty */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Status:</span>
                {outOfStock ? (
                  <span className="font-bold text-red-600">Out of Stock</span>
                ) : (
                  <span className="font-bold text-green-600">In Stock</span>
                )}
              </div>

              {!outOfStock && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-500">Quantity:</span>
                  <div className="flex items-center rounded-lg border bg-slate-50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-lg"
                      onClick={() => changeQty(-1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-xs font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-lg"
                      onClick={() => changeQty(1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => handleAddToCart(false)}
                disabled={outOfStock}
                className="w-full h-11 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold shadow-sm transition-colors border border-amber-500/20"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Add to Cart</span>
              </Button>

              <Button
                onClick={() => handleAddToCart(true)}
                disabled={outOfStock}
                className="w-full h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition-colors"
              >
                <span>Buy Now</span>
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Product Comparison Matrix Block */}
      <div className="space-y-4 border-t pt-10">
        <h2 className="text-lg font-bold text-slate-900">Compare with similar items</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-800 w-1/4">Feature</th>
                <th className="p-4 font-bold text-slate-900 w-1/4 border-l bg-amber-50/30">
                  {comparisonData.columns[0].label}
                </th>
                <th className="p-4 font-medium text-slate-700 w-1/4 border-l">
                  {comparisonData.columns[1].label}
                </th>
                <th className="p-4 font-medium text-slate-700 w-1/4 border-l">
                  {comparisonData.columns[2].label}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-4 font-semibold text-slate-600">Price</td>
                <td className="p-4 font-bold text-slate-900 border-l bg-amber-50/20">
                  {comparisonData.columns[0].price}
                </td>
                <td className="p-4 text-slate-700 border-l">{comparisonData.columns[1].price}</td>
                <td className="p-4 text-slate-700 border-l">{comparisonData.columns[2].price}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-600">Customer Rating</td>
                <td className="p-4 border-l bg-amber-50/20">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-slate-800 font-bold">{avgRating} / 5.0</span>
                  </div>
                </td>
                <td className="p-4 text-slate-700 border-l">4.6 / 5.0</td>
                <td className="p-4 text-slate-700 border-l">4.8 / 5.0</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-600">{comparisonData.features[0].title}</td>
                <td className="p-4 border-l bg-amber-50/20">{comparisonData.columns[0].attr1}</td>
                <td className="p-4 text-slate-700 border-l">{comparisonData.columns[1].attr1}</td>
                <td className="p-4 text-slate-700 border-l">{comparisonData.columns[2].attr1}</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-600">{comparisonData.features[1].title}</td>
                <td className="p-4 border-l bg-amber-50/20 text-green-700 font-semibold">{comparisonData.columns[0].attr2}</td>
                <td className="p-4 text-slate-700 border-l">{comparisonData.columns[1].attr2}</td>
                <td className="p-4 text-slate-700 border-l">{comparisonData.columns[2].attr2}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Q&A Block */}
      <div className="space-y-5 border-t pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Customer Questions & Answers (Q&A)</h2>
          <div className="relative max-w-xs">
            <input
              type="text"
              placeholder="Search questions..."
              value={qaSearch}
              onChange={(e) => setQaSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#f47920]"
            />
          </div>
        </div>

          <form onSubmit={handleSubmitQA} className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="Ask a question about this product..." 
              value={newQA} 
              onChange={(e) => setNewQA(e.target.value)} 
              className="flex-1 h-10 rounded-md border border-slate-200 px-3 text-xs outline-none focus:border-[#f47920]" 
              required
            />
            <Button type="submit" className="h-10 bg-[#f47920] hover:bg-[#e56910]">Ask</Button>
          </form>

        <div className="space-y-4">
          {filteredQAs.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No questions found.</p>
          ) : (
            filteredQAs.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">Q</span>
                  <p className="font-semibold text-slate-800 pt-0.5">{item.question}</p>
                </div>
                {item.answer && (
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-[#f47920]">A</span>
                    <p className="text-slate-600 pt-0.5">{item.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Reviews & Star Ratings Graph Block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t pt-10">
        
        {/* Left Column: Stars Histogram Graph & Add Review Form */}
        <div className="md:col-span-4 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Customer Reviews</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(Number(avgRating)) ? "fill-current" : "text-slate-200"}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">{avgRating} out of 5.0</span>
              </div>
              <p className="text-xs text-slate-500">{totalReviews} global ratings</p>
            </div>

            {/* Histogram bar items */}
            <div className="space-y-2 pt-2">
              {ratingCounts.map((item) => (
                <div key={item.star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-slate-600 font-medium select-none">{item.star} star</span>
                  <div className="h-4 flex-1 overflow-hidden rounded-md bg-slate-100 border border-slate-200/50">
                    <div
                      className="h-full bg-amber-400 rounded-md transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-500 font-medium">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-200/80" />

          {/* Write Review Form Card */}
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">Write a review for this product</h4>
            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 py-1 outline-none focus:border-[#f47920] bg-white"
                />
              </div>

              {/* Interactive Rating Star Picker */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Rating (Give stars)</label>
                <div className="flex gap-1 text-slate-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="focus:outline-none transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReviewRating ? "text-amber-400 fill-current" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Review Title</label>
                <input
                  type="text"
                  required
                  placeholder="Main attraction (e.g., Great product!)"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 py-1 outline-none focus:border-[#f47920] bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600">Your Review</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your detailed comments about the product..."
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f47920] bg-white resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold transition-colors"
              >
                <span>Submit Review</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Reviews List */}
        <div className="md:col-span-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Customer Reviews</h3>
          <div className="divide-y divide-slate-100 space-y-4">
            {reviews.map((rev, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#f47920] text-xs">
                    {rev.name.substring(0, 1)}
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{rev.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-current" : "text-slate-200"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800">{rev.title}</span>
                </div>
                <p className="text-xs text-slate-400">
                  Reviewed on {rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "recently"} • <span className="text-green-700 font-semibold" lang="bn">Verified Purchase</span>
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {rev.content}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
