export const ORDER_STATUS_BN: Record<string, string> = {
  pending: "অপেক্ষমান",
  confirmed: "নিশ্চিত",
  processing: "প্রস্তুতি চলছে",
  shipped: "পাঠানো হয়েছে",
  delivered: "পৌঁছে গেছে",
  cancelled: "বাতিল",
};

export const PAYMENT_STATUS_BN: Record<string, string> = {
  pending: "অপেক্ষমান",
  paid: "পরিশোধিত",
  failed: "ব্যর্থ",
  refunded: "ফেরত",
};

export const ORDER_STATUS_CLASS: Record<string, string> = {
  pending: "border-amber-300 text-amber-700",
  confirmed: "border-blue-300 text-blue-700",
  processing: "border-blue-300 text-blue-700",
  shipped: "border-indigo-300 text-indigo-700",
  delivered: "border-green-300 text-green-700",
  cancelled: "border-red-300 text-red-700",
};

export const PAYMENT_METHOD_BN: Record<string, string> = {
  cod: "ক্যাশ অন ডেলিভারি",
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  card: "কার্ড",
};

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
