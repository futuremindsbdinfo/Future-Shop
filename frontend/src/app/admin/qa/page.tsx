"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HelpCircle,
  MessageCircleQuestion,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface QuestionItem {
  id: number;
  product_id: number;
  user_name: string;
  question: string;
  answer: string | null;
  is_answered: boolean;
  created_at: string;
  product?: { id: number; name: string; slug?: string };
}

export default function AdminQAPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "answered">("pending");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Reply dialog
  const [replyTarget, setReplyTarget] = useState<QuestionItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "staff")) {
      router.replace("/fuminds");
    }
  }, [hydrated, isAuthenticated, user, router]);

  const openReply = (q: QuestionItem) => {
    setReplyTarget(q);
    setReplyText(q.answer || "");
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.error("অনুগ্রহ করে উত্তর লিখুন");
      return;
    }
    setSubmitting(true);
    try {
      // Optimistic update
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === replyTarget?.id
            ? { ...q, answer: replyText.trim(), is_answered: true }
            : q
        )
      );
      toast.success("উত্তরের উত্তর সফলভাবে প্রকাশ করা হয়েছে!");
      setReplyTarget(null);
    } catch {
      toast.error("উত্তর সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated || !isAuthenticated || (user?.role !== "admin" && user?.role !== "staff")) {
    return <LoadingSpinner fullHeight />;
  }

  const filteredQuestions = questions.filter((q) =>
    activeTab === "pending" ? !q.is_answered : q.is_answered
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight" lang="bn">
              প্রশ্ন ও উত্তর (Product Q&A)
            </h1>
            <Badge className="bg-orange-50 text-[#f47920] border-orange-200 font-bold text-xs">
              কাস্টমার প্রশ্নোত্তর
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" lang="bn">
            পণ্য সম্পর্কে গ্রাহকদের প্রশ্নাবলী পর্যালোচনা এবং সরাসরি অফিসিয়াল উত্তর প্রদান
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl border border-gray-200 overflow-hidden p-1 bg-gray-100/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "pending"
                ? "bg-white text-orange-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>উত্তরের অপেক্ষায়</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("answered")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "answered"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>উত্তর দেওয়া হয়েছে</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs min-w-[180px]">পণ্য (Product)</TableHead>
                <TableHead className="font-bold text-xs min-w-[140px]">গ্রাহকের নাম</TableHead>
                <TableHead className="font-bold text-xs min-w-[280px]">প্রশ্ন ও উত্তর</TableHead>
                <TableHead className="font-bold text-xs">তারিখ</TableHead>
                <TableHead className="text-right font-bold text-xs">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-xs text-muted-foreground" lang="bn">
                    {activeTab === "pending"
                      ? "কোনো অমীমাংসিত প্রশ্ন নেই। সকল প্রশ্নের উত্তর দেওয়া হয়েছে!"
                      : "কোনো উত্তর দেওয়া প্রশ্ন খুঁজে পাওয়া যায়নি।"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((q) => (
                  <TableRow key={q.id} className="hover:bg-orange-50/20 transition-colors">
                    
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-bold text-gray-900 line-clamp-1">
                          {q.product?.name || `Product #${q.product_id}`}
                        </p>
                        {q.product?.slug && (
                          <Link
                            href={`/products/${q.product.slug}`}
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
                          {q.user_name.charAt(0).toUpperCase()}
                        </span>
                        <p className="font-bold text-gray-800">{q.user_name}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1.5 max-w-[340px]">
                        <p className="font-bold text-gray-900 text-xs flex items-start gap-1">
                          <span className="text-[#f47920] font-mono font-black">Q:</span>
                          <span>{q.question}</span>
                        </p>
                        {q.answer && (
                          <p className="text-gray-600 text-[11px] leading-relaxed flex items-start gap-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <span className="text-emerald-600 font-mono font-black">A:</span>
                            <span>{q.answer}</span>
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                      {new Date(q.created_at).toLocaleDateString("bn-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        onClick={() => openReply(q)}
                        className="h-8 px-2.5 rounded-lg bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-2xs flex items-center gap-1 ml-auto"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{q.is_answered ? "এডিট উত্তর" : "উত্তর দিন"}</span>
                      </Button>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!replyTarget} onOpenChange={(open) => !open && setReplyTarget(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900" lang="bn">গ্রাহকের প্রশ্নের উত্তর দিন</DialogTitle>
          </DialogHeader>

          {replyTarget && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-1">
                <span className="text-muted-foreground text-[11px] block">
                  পণ্য: <strong>{replyTarget.product?.name ?? `#${replyTarget.product_id}`}</strong>
                </span>
                <p className="font-bold text-gray-900 text-xs flex items-start gap-1.5 pt-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#f47920] shrink-0 mt-0.5" />
                  <span>&ldquo;{replyTarget.question}&rdquo;</span>
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-gray-700 block" lang="bn">
                  অফিসিয়াল উত্তর লিখুন <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="গ্রাহকের প্রশ্নের স্পষ্ট ও তথ্যবহুল উত্তর লিখুন..."
                  className="flex w-full rounded-2xl border border-gray-200 bg-transparent px-3 py-2.5 text-xs outline-none focus:border-[#f47920] focus:ring-2 focus:ring-[#f47920]/20 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              onClick={() => setReplyTarget(null)}
              variant="ghost"
              className="h-10 rounded-xl text-xs"
              disabled={submitting}
            >
              বাতিল
            </Button>
            <Button
              onClick={submitReply}
              className="h-10 rounded-xl bg-[#f47920] hover:bg-[#d46212] text-white text-xs font-bold shadow-xs"
              disabled={submitting}
            >
              {submitting ? "প্রকাশ হচ্ছে..." : "উত্তর প্রকাশ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
