import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "শর্তাবলী | Future Shop",
  description: "Future Shop ব্যবহার করার নিয়ম এবং শর্তাবলী। অনুগ্রহ করে কেনাকাটার পূর্বে মনোযোগ দিয়ে পড়ে নিন।",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            শর্তাবলী
          </h1>
          <p className="text-muted-foreground text-sm font-mono" lang="bn">
            সর্বশেষ হালনাগাদ: জুন ২০২৬
          </p>
          <div className="h-1 w-20 bg-[#f47920] mx-auto rounded"></div>
        </div>

        <div className="prose max-w-none text-muted-foreground space-y-6 text-sm md:text-base leading-relaxed" lang="bn">
          <p>
            <strong>Future Shop</strong> ব্যবহার করার মাধ্যমে আপনি নিচের শর্তাবলীতে সম্মত হচ্ছেন। অনুগ্রহ করে মনোযোগ দিয়ে পড়ুন।
          </p>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">১. সাধারণ</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Future Shop একটি অনলাইন শপিং প্ল্যাটফর্ম, যা শেরপুর, বগুড়া অঞ্চলে সেবা প্রদান করে।</li>
              <li>আমাদের সেবা ব্যবহার করতে আপনার সঠিক ও সত্য তথ্য প্রদান করতে হবে।</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">২. অর্ডার ও মূল্য</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>সকল পণ্যের মূল্য বাংলাদেশি টাকায় (৳) প্রদর্শিত।</li>
              <li>আমরা যেকোনো সময় মূল্য ও পণ্যের প্রাপ্যতা পরিবর্তনের অধিকার রাখি।</li>
              <li>অর্ডার নিশ্চিত হওয়ার পর আমরা ফোনে যোগাযোগ করে অর্ডার নিশ্চিত করতে পারি।</li>
              <li>কোনো পণ্যের তথ্য বা দামে ভুল থাকলে আমরা অর্ডার বাতিল করার অধিকার রাখি।</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">৩. পেমেন্ট</h2>
            <p>
              বর্তমানে আমরা <strong>ক্যাশ অন ডেলিভারি (COD)</strong> সেবা প্রদান করি — অর্থাৎ পণ্য হাতে পেয়ে আপনি টাকা পরিশোধ করবেন।
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">৪. ডেলিভারি</h2>
            <p>
              আমরা শেরপুর, বগুড়া অঞ্চলে ডেলিভারি প্রদান করি। ডেলিভারির সময় এলাকা ও পণ্যের উপর নির্ভর করে।
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">৫. দায়বদ্ধতা</h2>
            <p>
              আমরা সর্বোচ্চ চেষ্টা করি সঠিক ও মানসম্পন্ন পণ্য পৌঁছে দিতে। তবে কোনো পণ্যে সমস্যা থাকলে আমাদের সাথে যোগাযোগ করুন (রিটার্ন নীতি দেখুন)।
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground font-sans" lang="bn">৬. অ্যাকাউন্ট</h2>
            <p>
              আপনার অ্যাকাউন্টের নিরাপত্তা আপনার দায়িত্ব। আপনার পাসওয়ার্ড গোপন রাখুন।
            </p>
          </div>

          <p className="pt-4 border-t text-sm">
            এই শর্তাবলী সময়ে সময়ে পরিবর্তিত হতে পারে। পরিবর্তন এই পেজে হালনাগাদ করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
