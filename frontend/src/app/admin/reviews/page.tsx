"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Trash2,
  XCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Package,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";
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
import { useAuthStore } from "@/store/authStore";
import type { PaginatedResponse } from "@/types";

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  name: string;
  rating: number;
  title: string | null;
  content: string;
  is_published: boolean;
  created_at: string;
  product?: { id: number; name: string; slug?: string };
  user?: { id: number; name: string };
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

export default function AdminReviewsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Auth gate
  const [hydrated, setHydrated] = useState(false);

  // Data
  const [statusTab, setStatusTab] = useState<"pending" | "published">("pending");
  const [data, setData] = useState<PaginatedResponse<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Action states
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "staff")) {
      router.replace("/fuminds");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", statusTab);
      params.set("page", String(page));
      params.set("per_page", "20");
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await api.get<PaginatedResponse<Review>>(
        `/admin/reviews?${params.toString()}`
      );
      setData(res.data);
    } catch {
      toast.error("রিভিউ তালিকা লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [statusTab, page, searchQuery]);

  useEffect(() => {
    if (hydrated && isAuthenticated && (user?.role === "admin" || user?.role === "staff")) {
      load();
    }
  }, [load, hydrated, isAuthenticated, user]);

  useEffect(() => {
    setPage(1);
  }, [statusTab]);

  const approveReview = async (reviewId: number) => {
    setProcessingId(reviewId);
    try {
      await api.patch(`/admin/reviews/${reviewId}/approve`);
      toast.success("রিভিউটি সফলভাবে অনুমোদন (Approve) করা হয়েছে!");
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "অনুমোদন ব্যর্থ হয়েছে");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/reviews/${deleteTarget.id}`);
      toast.success("রিভিউ সফলভাবে মুছে ফেলা হয়েছে");
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
            }`}
          />
        ))}
        <span className="ml-1 text-[11px] font-bold text-gray-700 font-mono">
          {rating}.0
        </span>
      </div>
    );
  };

  if (!hydrated || !isAuthenticated || (user?.role !== "admin" && user?.role !== "staff")) {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Status Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              গ্রাহক রিভিউ ও রেটিং (Customer Reviews)
            </h1>
            {data && (
              <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
                মোট {data.total}টি রিভিউ
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            পণ্যভিত্তিক গ্রাহক মতামত, ৫-স্টার রেটিং ও প্রকাশনা অনুমোদন
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl border border-gray-200 overflow-hidden p-1 bg-gray-100/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusTab("pending")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              statusTab === "pending"
                ? "bg-white text-orange-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>অপেক্ষমান (Pending)</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusTab("published")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              statusTab === "published"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>প্রকাশিত (Published)</span>
          </button>
        </div>
      </div>

      {/* Reviews Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[180px]">পণ্য (Product)</TableHead>
                <TableHead className="font-bold text-xs min-w-[150px]">গ্রাহকের নাম</TableHead>
                <TableHead className="font-bold text-xs">স্টার রেটিং</TableHead>
                <TableHead className="font-bold text-xs min-w-[280px]">মতামত ও বিবরণ</TableHead>
                <TableHead className="font-bold text-xs">তারিখ</TableHead>
                <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : !data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    {statusTab === "pending"
                      ? "অনুমোদনের অপেক্ষায় কোনো রিভিউ নেই।"
                      : "কোনো প্রকাশিত রিভিউ খুঁজে পাওয়া যায়নি।"}
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((review) => (
                  <TableRow key={review.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 line-clamp-1">
                          {review.product?.name || `Product #${review.product_id}`}
                        </p>
                        {review.product?.slug && (
                          <Link
                            href={`/products/${review.product.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] text-[#f47920] hover:underline"
                          >
                            <span>পণ্য দেখুন</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-[#f47920] font-bold text-xs">
                          {(review.user?.name || review.name || "A").charAt(0).toUpperCase()}
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-800">
                            {review.user?.name || review.name || "গেস্ট গ্রাহক"}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            ভেরিফাইড ক্রেতা
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{renderStars(review.rating)}</TableCell>

                    <TableCell>
                      <div className="space-y-1 max-w-[320px]">
                        {review.title && (
                          <p className="font-bold text-gray-900 line-clamp-1">{review.title}</p>
                        )}
                        <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2" title={review.content}>
                          {review.content}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {statusTab === "pending" && (
                          <Button
                            onClick={() => approveReview(review.id)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1"
                            disabled={processingId === review.id}
                            title="অনুমোদন করুন"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>অ্যাপ্রুভ</span>
                          </Button>
                        )}
                        <Button
                          onClick={() => setDeleteTarget(review)}
                          className="h-8 px-2.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                          variant="ghost"
                          disabled={processingId === review.id}
                          title={statusTab === "pending" ? "বাতিল করুন" : "মুছে ফেলুন"}
                        >
                          {statusTab === "pending" ? (
                            <>
                              <XCircle className="h-3.5 w-3.5" />
                              <span>বাতিল</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>ডিলিট</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <span className="text-xs text-muted-foreground font-semibold" lang="bn">
            দেখানো হচ্ছে {(data.from ?? 1)} থেকে {(data.to ?? data.data.length)} (মোট {data.total}টি রিভিউ)
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

      {/* Delete/Reject Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">
              {statusTab === "pending" ? "রিভিউটি বাতিল করবেন?" : "রিভিউটি মুছে ফেলবেন?"}
            </DialogTitle>
          </DialogHeader>
          <p className="py-2 text-xs text-muted-foreground leading-relaxed" lang="bn">
            আপনি কি নিশ্চিত যে এই রিভিউটি {statusTab === "pending" ? "বাতিল" : "মুছে ফেলতে"} চান? এই অ্যাকশনটি ফিরিয়ে আনা যাবে না।
          </p>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDeleteTarget(null)}
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={deleting}
            >
              বাতিল
            </Button>
            <Button
              onClick={confirmDelete}
              className="h-10 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold"
              disabled={deleting}
            >
              {deleting ? "প্রক্রিয়াধীন..." : statusTab === "pending" ? "বাতিল করুন" : "মুছে ফেলুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
