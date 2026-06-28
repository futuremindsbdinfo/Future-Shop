import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "রিটার্ন ও ফেরত নীতি | Future Shop",
  description: "আমরা চাই আপনি আপনার কেনাকাটায় সম্পূর্ণ সন্তুষ্ট থাকুন। কোনো সমস্যা হলে আমাদের রিটার্ন ও রিফান্ড নীতি অনুসরণ করুন।",
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            রিটার্ন ও ফেরত নীতি
          </h1>
          <p className="text-muted-foreground text-sm font-mono" lang="bn">
            সর্বশেষ হালনাগাদ: জুন ২০২৬
          </p>
          <div className="h-1 w-20 bg-[#f47920] mx-auto rounded"></div>
        </div>

        <div className="prose max-w-none text-muted-foreground space-y-6 text-sm md:text-base leading-relaxed" lang="bn">
          <p>
            আমরা চাই আপনি আপনার কেনাকাটায় সম্পূর্ণ সন্তুষ্ট থাকুন। কোনো সমস্যা হলে নিচের নীতি অনুসরণ করুন।
          </p>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">রিটার্ন কখন গ্রহণযোগ্য</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>পণ্য <strong>ত্রুটিপূর্ণ, ভাঙা বা নষ্ট</strong> অবস্থায় পেলে</li>
              <li><strong>ভুল পণ্য</strong> ডেলিভারি হলে</li>
              <li>পণ্যের <strong>মেয়াদ উত্তীর্ণ</strong> হলে</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">রিটার্নের নিয়ম</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>পণ্য হাতে পাওয়ার সময়ই ডেলিভারি এজেন্টের সামনে পরীক্ষা করে নিন।</li>
              <li>সমস্যা থাকলে <strong>পণ্য গ্রহণের ২৪ ঘণ্টার মধ্যে</strong> আমাদের সাথে যোগাযোগ করুন।</li>
              <li>পণ্য অবশ্যই অব্যবহৃত ও আসল অবস্থায় (প্যাকেজিং সহ) থাকতে হবে।</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">যা রিটার্ন করা যাবে না</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>ব্যবহৃত বা খোলা পণ্য (স্বাস্থ্য/খাদ্যপণ্যের ক্ষেত্রে)</li>
              <li>যৌক্তিক কারণ ছাড়া শুধু পছন্দ না হওয়া</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">ফেরত (Refund)</h2>
            <p>
              যেহেতু আমরা ক্যাশ অন ডেলিভারি সেবা দিই, ত্রুটিপূর্ণ পণ্যের ক্ষেত্রে পণ্য পরিবর্তন (replacement) বা টাকা ফেরত দেওয়া হবে। সমস্যা যাচাইয়ের পর দ্রুততম সময়ে সমাধান করা হবে।
            </p>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm font-medium text-foreground">
              📞 ফোন: ০১৮১৩৩৫৪৬৪৮ · ✉️ ইমেইল: futuremindsbd.info@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
