import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি | Future Shop",
  description: "Future Shop আপনার গোপনীয়তাকে সম্মান করে। এই নীতিতে আমরা ব্যাখ্যা করছি কীভাবে আমরা আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করি।",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            গোপনীয়তা নীতি
          </h1>
          <p className="text-muted-foreground text-sm font-mono" lang="bn">
            সর্বশেষ হালনাগাদ: জুন ২০২৬
          </p>
          <div className="h-1 w-20 bg-[#f47920] mx-auto rounded"></div>
        </div>

        <div className="prose max-w-none text-muted-foreground space-y-6 text-sm md:text-base leading-relaxed" lang="bn">
          <p>
            <strong>Future Shop</strong> আপনার গোপনীয়তাকে সম্মান করে। এই নীতিতে আমরা ব্যাখ্যা করছি কীভাবে আমরা আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করি।
          </p>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">আমরা যে তথ্য সংগ্রহ করি</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong>ব্যক্তিগত তথ্য:</strong> নাম, ফোন নম্বর, ইমেইল ঠিকানা, ডেলিভারি ঠিকানা — যা আপনি অর্ডার বা অ্যাকাউন্ট তৈরির সময় দেন।
              </li>
              <li>
                <strong>অর্ডার তথ্য:</strong> আপনি কী কিনেছেন, কখন কিনেছেন, ডেলিভারির বিবরণ।
              </li>
              <li>
                <strong>স্বয়ংক্রিয় তথ্য:</strong> ওয়েবসাইট ব্যবহারের সাধারণ তথ্য (যেমন কোন পণ্য দেখেছেন)।
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">আমরা কীভাবে আপনার তথ্য ব্যবহার করি</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>আপনার অর্ডার প্রক্রিয়া ও ডেলিভারি সম্পন্ন করতে</li>
              <li>আপনার সাথে অর্ডার সম্পর্কিত যোগাযোগ করতে (ফোন/ইমেইল)</li>
              <li>আমাদের সেবা উন্নত করতে</li>
              <li>আইনি প্রয়োজনে</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">তথ্য সুরক্ষা</h2>
            <p>
              আমরা আপনার তথ্য সুরক্ষিত রাখতে যথাযথ নিরাপত্তা ব্যবস্থা গ্রহণ করি। আপনার পাসওয়ার্ড এনক্রিপ্ট করা থাকে এবং আমরা কখনোই আপনার সংবেদনশীল তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">তথ্য শেয়ার করা</h2>
            <p>
              আমরা শুধুমাত্র ডেলিভারির প্রয়োজনে (যেমন ডেলিভারি এজেন্টের সাথে আপনার ঠিকানা ও ফোন) আপনার তথ্য শেয়ার করি। এছাড়া আইনি বাধ্যবাধকতা ছাড়া কারও সাথে তথ্য শেয়ার করি না।
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">আপনার অধিকার</h2>
            <p>
              আপনি যেকোনো সময় আপনার অ্যাকাউন্টের তথ্য দেখতে, সংশোধন করতে বা মুছে ফেলার অনুরোধ করতে পারেন। এজন্য আমাদের সাথে যোগাযোগ করুন।
            </p>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm font-medium text-foreground">
              ✉️ ইমেইল: futuremindsbd.info@gmail.com · 📞 ফোন: ০১৮১৩৩৫৪৬৪৮
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
