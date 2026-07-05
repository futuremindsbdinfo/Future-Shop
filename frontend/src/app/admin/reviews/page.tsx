"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  product?: { id: number; name: string };
  user?: { id: number; name: string };
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

  // Action states
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  // One-tick hydration gate
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/fuminds");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Review>>(
        `/admin/reviews?status=${statusTab}&page=${page}`
      );
      setData(res.data);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [statusTab, page]);

  useEffect(() => {
    if (hydrated && isAuthenticated && user?.role === "admin") {
      load();
    }
  }, [load, hydrated, isAuthenticated, user]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [statusTab]);

  const approveReview = async (reviewId: number) => {
    setProcessingId(reviewId);
    try {
      await api.patch(`/admin/reviews/${reviewId}/approve`);
      toast.success("Review approved successfully");
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to approve review");
    } finally {
      setProcessingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/reviews/${deleteTarget.id}`);
      toast.success("Review deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || "Failed to delete review");
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "opacity-100" : "opacity-30"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (!hydrated || !isAuthenticated || user?.role !== "admin") {
    return <LoadingSpinner fullHeight />;
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Reviews Management</h1>
        <Tabs
          value={statusTab}
          onValueChange={(val) => setStatusTab(val as "pending" | "published")}
          className="w-full sm:w-[300px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="rounded-xl border border-[#f1f5f9] shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No {statusTab} reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.product?.name || `Product #${review.product_id}`}
                    </TableCell>
                    <TableCell>
                      {review.user?.name || review.name || "Anonymous"}
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-[300px]">
                      {review.title && <div className="font-semibold">{review.title}</div>}
                      <div className="truncate text-sm text-muted-foreground" title={review.content}>
                        {review.content}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {statusTab === "pending" && (
                          <Button
                            onClick={() => approveReview(review.id)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            variant="ghost"
                            disabled={processingId === review.id}
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => setDeleteTarget(review)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          variant="ghost"
                          disabled={processingId === review.id}
                          title="Reject / Delete"
                        >
                          {statusTab === "pending" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            variant="outline"
            className="h-10 px-4"
          >
            Previous
          </Button>
          <span className="flex items-center px-2 text-sm text-muted-foreground">
            {page} / {data.last_page}
          </span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === data.last_page}
            variant="outline"
            className="h-10 px-4"
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete/Reject Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {statusTab === "pending" ? "Reject Review?" : "Delete Review?"}
            </DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            Are you sure you want to {statusTab === "pending" ? "reject" : "delete"} this review? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setDeleteTarget(null)}
              variant="ghost"
              className="h-11"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="h-11 bg-red-600 text-white hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? "Processing..." : statusTab === "pending" ? "Reject" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
