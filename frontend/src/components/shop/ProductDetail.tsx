"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ShieldCheck,
  RotateCcw,
  Heart,
  Share2,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { HorizontalProductScroll } from "@/components/home/HorizontalProductScroll";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatTaka } from "@/lib/utils";
import api from "@/lib/api";
import type { Product, ProductImage } from "@/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HELPLINE_PHONE = "01813354648";
const WHATSAPP_PHONE = "8801813354648";

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
  name?: string;
  question: string;
  answer?: string;
  is_answered?: boolean;
  created_at?: string;
}

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { toggle: toggleWishlist, has: inWishlist } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [qaSearch, setQaSearch] = useState("");

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Review states
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewContent, setNewReviewContent] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // QA states
  const [qas, setQas] = useState<QAItem[]>([]);
  const [newQA, setNewQA] = useState("");
  const [isSubmittingQA, setIsSubmittingQA] = useState(false);

  useEffect(() => {
    if (product?.id) {
      // 1. Fetch reviews
      api
        .get(`/products/${product.id}/reviews`)
        .then((res) => {
          setReviews(res.data.data || []);
        })
        .catch(() => {});

      // 2. Fetch Q&A
      api
        .get(`/products/${product.id}/qa`)
        .then((res) => {
          setQas(res.data.data || []);
        })
        .catch(() => {});

      // 3. Fetch Related Products from same category
      if (product.category?.slug) {
        api
          .get(`/products?category=${product.category.slug}&per_page=8`)
          .then((res) => {
            const allInCat: Product[] = res.data.data || [];
            // Exclude current product
            setRelatedProducts(allInCat.filter((p) => p.id !== product.id));
          })
          .catch(() => {});
      }
    }
  }, [product?.id, product?.category?.slug]);

  const price = Number(product.price);
  const salePrice = product.sale_price !== null ? Number(product.sale_price) : null;
  const hasSale = salePrice !== null && salePrice < price;
  const effectivePrice = hasSale && salePrice !== null ? salePrice : price;
  const discountPct =
    hasSale && salePrice !== null ? Math.round(((price - salePrice) / price) * 100) : 0;

  const outOfStock = product.status === "out_of_stock" || (product.stock_quantity ?? 0) <= 0;
  const isExternalSvg = (img: ProductImage) =>
    img.disk === "external" && /\.svg(\?|#|$)/i.test(img.url);
  const images = (product.images ?? []).filter((img) => img && img.url && !isExternalSvg(img));
  const hasImages = images.length > 0;
  const isGallery = images.length > 1;

  const isFavorite = inWishlist(product.id);

  const changeQty = (delta: number) => {
    setQuantity((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (product.stock_quantity && next > product.stock_quantity) return product.stock_quantity;
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
      stock: product.stock_quantity ?? 99,
      categorySlug: product.category?.slug,
    });
    if (redirect) {
      router.push("/cart");
    } else {
      toast.success(`${product.name} কার্টে যোগ হয়েছে!`);
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      image: images[0]?.url,
      stock: product.stock_quantity ?? 99,
    });
    if (isFavorite) {
      toast.info("পছন্দের তালিকা থেকে সরানো হয়েছে");
    } else {
      toast.success("পছন্দের তালিকায় যোগ করা হয়েছে ❤️");
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Future Shop-এ দেখুন: ${product.name} - ${formatTaka(effectivePrice)}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("প্রোডাক্ট লিংক কপি করা হয়েছে!");
    }
  };

  const handleWhatsAppOrder = () => {
    const productUrl = window.location.href;
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি Future Shop থেকে এই পণ্যটি অর্ডার করতে চাই:\n\n📌 *পণ্য:* ${product.name}\n💰 *মূল্য:* ${formatTaka(effectivePrice)}\n🔢 *পরিমাণ:* ${quantity}টি\n🔗 *লিংক:* ${productUrl}`
    );
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, "_blank");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewTitle.trim() || !newReviewContent.trim()) {
      toast.error("অনুগ্রহ করে সব তথ্য পূরণ করুন।");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await api.post(`/products/${product.id}/reviews`, {
        name: newReviewName,
        rating: newReviewRating,
        title: newReviewTitle,
        content: newReviewContent,
      });

      setReviews([res.data.data, ...reviews]);
      toast.success("আপনার রিভিউ সফলভাবে যুক্ত হয়েছে! ধন্যবাদ।");
      setNewReviewName("");
      setNewReviewTitle("");
      setNewReviewContent("");
      setNewReviewRating(5);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "রিভিউ জমা দিতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSubmitQA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQA.trim()) return;

    setIsSubmittingQA(true);
    try {
      const res = await api.post(`/products/${product.id}/qa`, {
        question: newQA,
      });
      setQas([res.data.data, ...qas]);
      setNewQA("");
      toast.success("আপনার প্রশ্ন সফলভাবে পাঠানো হয়েছে! শীঘ্রই উত্তর দেওয়া হবে।");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "প্রশ্ন পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmittingQA(false);
    }
  };

  const filteredQAs = qas.filter(
    (item) =>
      item.question.toLowerCase().includes(qaSearch.toLowerCase()) ||
      (item.answer && item.answer.toLowerCase().includes(qaSearch.toLowerCase()))
  );

  // Dynamic Rating calculations
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : star === 5 ? 100 : 0;
    return { star, pct, count };
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          ...(product.category
            ? [{ label: product.category.name, url: `/products?category=${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Column 1: Image Gallery (5 cols on Desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Desktop Vertical Thumbnails Strip (Left) */}
            {isGallery && (
              <div className="hidden md:flex flex-col gap-2.5 w-20 shrink-0 max-h-[460px] overflow-y-auto pr-1 select-none scrollbar-thin">
                {images.map((image, index) => (
                  <button
                    key={image.path ?? image.url}
                    onClick={() => setActiveImgIndex(index)}
                    className={`relative aspect-square w-full overflow-hidden rounded-xl border-2 bg-white transition-all ${
                      activeImgIndex === index
                        ? "border-[#f47920] ring-2 ring-[#f47920]/20 shadow-xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                      unoptimized={image.disk === "external"}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Display (Right) */}
            <div className="relative flex-1 aspect-square w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm min-h-[300px] md:min-h-[460px]">
              {!hasImages ? (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 text-muted-foreground bg-[#F8F9FA]">
                  <ShoppingBag className="h-12 w-12 text-gray-300" />
                  <span className="text-sm font-medium" lang="bn">কোনো ছবি নেই</span>
                </div>
              ) : (
                <>
                  {/* Desktop Preview */}
                  <div className="hidden md:block relative w-full h-full p-4 bg-[#F8F9FA]/40">
                    <Image
                      src={images[activeImgIndex]?.url || images[0].url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-4 transition-transform duration-300 hover:scale-105"
                      priority
                      unoptimized={images[activeImgIndex]?.disk === "external" || images[0].disk === "external"}
                    />
                  </div>

                  {/* Mobile Touch Swiper */}
                  <div className="block md:hidden w-full h-full bg-[#F8F9FA]/40">
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true }}
                      spaceBetween={10}
                      className="w-full h-full [&_.swiper-pagination-bullet-active]:bg-[#f47920]"
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

              {/* Discount Badge on Image */}
              {discountPct > 0 && !outOfStock && (
                <span className="absolute left-3 top-3 z-10 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                  -{discountPct}% ছাড়
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Product Info & Description (4 cols on Desktop) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f47920] bg-[#f47920]/10 px-2.5 py-0.5 rounded-md" lang="bn">
                <Sparkles className="w-3 h-3" />
                {product.brand?.name || product.category?.name || "Future Shop"}
              </span>

              {/* Wishlist & Share action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full border transition-all ${
                    isFavorite
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                  }`}
                  aria-label="Wishlist toggle"
                  title="পছন্দের তালিকায় রাখুন"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-[#f47920] hover:border-orange-200 transition-all"
                  aria-label="Share product"
                  title="শেয়ার করুন"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Q&A Summary */}
            <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-600 select-none flex-wrap">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="font-bold text-gray-800">{avgRating}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 font-medium">({totalReviews}টি রিভিউ)</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 font-medium">{qas.length}টি প্রশ্নোত্তর</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Pricing Section */}
          <div className="space-y-1.5 bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#f47920]">
                {formatTaka(effectivePrice)}
              </span>
              {hasSale && (
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {formatTaka(price)}
                </span>
              )}
            </div>
            <p className="text-xs text-green-700 font-semibold flex items-center gap-1" lang="bn">
              <Check className="h-3.5 w-3.5" />
              <span>সেরা মূল্যের নিশ্চয়তা ও ১০০% আসল পণ্য</span>
            </p>
          </div>

          {/* Key Specifications (if any) */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider" lang="bn">
                পণ্যের বিবরণ ও স্পেসিফিকেশন
              </h3>
              <div className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50/50">
                <dl className="divide-y divide-gray-100">
                  {product.attributes.map((attr, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 px-3.5 py-2 text-xs">
                      <dt className="font-semibold text-gray-500">{attr.title}</dt>
                      <dd className="col-span-2 text-gray-800 font-medium">{attr.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider" lang="bn">
              বিস্তারিত বিবরণ
            </h3>
            {product.description ? (
              <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-gray-100">
                {product.description}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic" lang="bn">
                এই পণ্যটির কোনো বাড়তি বিবরণ যোগ করা হয়নি।
              </p>
            )}
          </div>
        </div>

        {/* Column 3: Buy Box (3 cols on Desktop - Sticky) */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            
            {/* Price Header */}
            <div>
              <span className="text-xs text-gray-500 font-medium" lang="bn">মোট মূল্য:</span>
              <p className="text-2xl font-bold text-gray-900">{formatTaka(effectivePrice * quantity)}</p>
            </div>

            {/* Delivery & Trust Features */}
            <div className="space-y-2.5 text-xs text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <div className="flex items-start gap-2.5">
                <Truck className="h-4 w-4 text-[#f47920] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800" lang="bn">হোম ডেলিভারি</p>
                  <p className="text-[11px] text-gray-600" lang="bn">শেরপুর, বগুড়ায় ১-২ দিনের মধ্যে দ্রুত ডেলিভারি।</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800" lang="bn">ক্যাশ অন ডেলিভারি</p>
                  <p className="text-[11px] text-gray-600" lang="bn">পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করুন।</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800" lang="bn">২৪ ঘণ্টা রিটার্ন পলিসি</p>
                  <p className="text-[11px] text-gray-600" lang="bn">সমস্যা থাকলে দ্রুত রিটার্ন ও রিপ্লেসমেন্ট।</p>
                </div>
              </div>
            </div>

            {/* Stock Status & Quantity Selector */}
            <div className="space-y-3 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-500" lang="bn">স্টক স্ট্যাটাস:</span>
                {outOfStock ? (
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md" lang="bn">
                    স্টক শেষ
                  </span>
                ) : (
                  <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md" lang="bn">
                    স্টকে আছে ({product.stock_quantity ?? "উপলব্ধ"})
                  </span>
                )}
              </div>

              {!outOfStock && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-500" lang="bn">পরিমাণ (Qty):</span>
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-xl hover:bg-gray-200"
                      onClick={() => changeQty(-1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-xs font-bold text-gray-800">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-xl hover:bg-gray-200"
                      onClick={() => changeQty(1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={() => handleAddToCart(false)}
                disabled={outOfStock}
                className="w-full h-11 rounded-xl bg-orange-100 hover:bg-orange-200 text-[#f47920] font-bold text-sm shadow-xs transition-colors border border-orange-200"
                lang="bn"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>কার্টে যোগ করুন</span>
              </Button>

              <Button
                onClick={() => handleAddToCart(true)}
                disabled={outOfStock}
                className="w-full h-11 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-bold text-sm shadow-md transition-colors"
                lang="bn"
              >
                <span>এখনই কিনুন</span>
              </Button>

              {/* Direct WhatsApp Order Button */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all mt-1"
                lang="bn"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>হোয়াটসঅ্যাপে অর্ডার করুন</span>
              </button>

              {/* Helpline Call Button */}
              <a
                href={`tel:${HELPLINE_PHONE}`}
                className="w-full h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all text-center"
                lang="bn"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#f47920]" />
                <span>ফোনে অর্ডার করুন ({HELPLINE_PHONE})</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Related Products Carousel (Replaces fake table) */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <HorizontalProductScroll
            title="সম্পর্কিত অন্যান্য পণ্যসমূহ (Related Products)"
            products={relatedProducts}
            viewAllLink={`/products?category=${product.category?.slug}`}
          />
        </div>
      )}

      {/* Customer Q&A Block */}
      <div className="space-y-5 border-t border-gray-200 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2" lang="bn">
              <HelpCircle className="w-5 h-5 text-[#f47920]" />
              গ্রাহক প্রশ্নোত্তর ({qas.length}টি প্রশ্ন)
            </h2>
            <p className="text-xs text-muted-foreground" lang="bn">
              পণ্যটি সম্পর্কে কোনো প্রশ্ন থাকলে নিচের বক্সে লিখে জমা দিন
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="প্রশ্ন খুঁজুন..."
              value={qaSearch}
              onChange={(e) => setQaSearch(e.target.value)}
              className="h-9 w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#f47920] bg-white"
            />
          </div>
        </div>

        {/* Ask Question Form */}
        <form onSubmit={handleSubmitQA} className="flex gap-2">
          <input
            type="text"
            placeholder="পণ্যটি সম্পর্কে আপনার কোনো প্রশ্ন থাকলে লিখুন..."
            value={newQA}
            onChange={(e) => setNewQA(e.target.value)}
            className="flex-1 h-11 rounded-xl border border-gray-200 px-3.5 text-xs outline-none focus:border-[#f47920] bg-white shadow-xs"
            required
          />
          <Button
            type="submit"
            disabled={isSubmittingQA}
            className="h-11 px-5 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white font-semibold text-xs flex items-center gap-1.5"
            lang="bn"
          >
            <Send className="w-3.5 h-3.5" />
            <span>প্রশ্ন পাঠান</span>
          </Button>
        </form>

        {/* QA List */}
        <div className="space-y-3 pt-2">
          {filteredQAs.length === 0 ? (
            <p className="text-xs text-gray-500 py-3 bg-gray-50 rounded-xl p-4 text-center" lang="bn">
              এখনো কোনো প্রশ্নোত্তর নেই। আপনি প্রথম প্রশ্নকারী হতে পারেন!
            </p>
          ) : (
            filteredQAs.map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-100 p-4 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-[#f47920] text-xs">
                    Q
                  </span>
                  <p className="font-semibold text-gray-800 text-xs pt-0.5">{item.question}</p>
                </div>
                {item.answer ? (
                  <div className="flex items-start gap-2.5 pl-2 border-l-2 border-green-500 ml-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700 text-xs">
                      A
                    </span>
                    <p className="text-gray-700 text-xs pt-0.5">{item.answer}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 pl-7" lang="bn">
                    ⏳ উত্তর অপেক্ষমাণ...
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Reviews & Star Ratings Graph Block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-gray-200 pt-10">
        
        {/* Left Column: Stars Histogram Graph & Add Review Form */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900" lang="bn">
              কাস্টমার রিভিউ ও রেটিং
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(Number(avgRating)) ? "fill-current" : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-base font-bold text-gray-900">{avgRating} / ৫.০</span>
              <span className="text-xs text-muted-foreground">({totalReviews}টি রিভিউ)</span>
            </div>

            {/* Histogram bars */}
            <div className="space-y-2 pt-1">
              {ratingCounts.map((item) => (
                <div key={item.star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-gray-600 font-medium select-none">{item.star} স্টার</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 border border-gray-200/50">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-500 font-medium">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Form Card */}
          <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-900" lang="bn">
              একটি রিভিউ লিখুন
            </h4>
            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700" lang="bn">আপনার নাম</label>
                <input
                  type="text"
                  required
                  placeholder="আপনার পুরো নাম লিখুন"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 py-1 outline-none focus:border-[#f47920] bg-gray-50/50"
                />
              </div>

              {/* Interactive Rating Star Picker */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700" lang="bn">রেটিং দিন</label>
                <div className="flex gap-1.5 text-gray-300 pt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newReviewRating ? "text-amber-400 fill-current" : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700" lang="bn">রিভিউ শিরোনাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: অসাধারণ প্রোডাক্ট / খুব ভালো কোয়ালিটি"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 px-3 py-1 outline-none focus:border-[#f47920] bg-gray-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700" lang="bn">আপনার মন্তব্য</label>
                <textarea
                  required
                  rows={3}
                  placeholder="পণ্যটির গুণমান ও ডেলিভারি সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                  value={newReviewContent}
                  onChange={(e) => setNewReviewContent(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-[#f47920] bg-gray-50/50 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full h-10 bg-[#f47920] hover:bg-[#d46212] text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                lang="bn"
              >
                <span>রিভিউ জমা দিন</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Reviews List */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-base font-bold text-gray-900" lang="bn">
            কাস্টমারদের মতামত ও রেটিং ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="bg-white border border-gray-100 p-8 rounded-2xl text-center space-y-2">
              <Star className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500 font-medium" lang="bn">
                এখনো কোনো রিভিউ যোগ করা হয়নি। প্রথম রিভিউটি আপনি দিন!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev, idx) => (
                <div key={idx} className="bg-white border border-gray-100 p-4 rounded-xl space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#f47920]/10 flex items-center justify-center font-bold text-[#f47920] text-xs">
                        {rev.name.substring(0, 1)}
                      </div>
                      <span className="text-xs font-bold text-gray-800">{rev.name}</span>
                    </div>
                    <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                      ✓ যাচাইকৃত ক্রেতা
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-current" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">{rev.title}</span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed">{rev.content}</p>

                  <p className="text-[10px] text-gray-400">
                    {rev.created_at
                      ? new Date(rev.created_at).toLocaleDateString("bn-BD", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "সম্প্রতি"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
