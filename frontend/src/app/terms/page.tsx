import type { Metadata } from "next";
import {
  AlertCircle,
  Banknote,
  CheckCircle,
  FileCheck,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "শর্তাবলী (Terms & Conditions) | Future Shop",
  description:
    "Future Shop শেরপুর, বগুড়া — ব্যবহারের নিয়মাবলী এবং শর্তাবলী। কেনাকাটার পূর্বে বিস্তারিত জেনে নিন।",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f47920]/10 text-[#f47920] text-xs md:text-sm font-semibold">
            <Scale className="h-4 w-4" />
            <span>আইনি নির্দেশিকা ও শর্তাবলী</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            শর্তাবলী (Terms & Conditions)
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed" lang="bn">
            Future Shop ওয়েবসাইট ব্যবহার বা পণ্য অর্ডার করার পূর্বে অনুগ্রহ করে আমাদের শর্তাবলী মনোযোগ সহকারে পড়ে নিন।
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-mono">
            <span>সর্বশেষ হালনাগাদ: আগস্ট ২০২৬</span>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-[#f47920] to-[#fb923c] mx-auto rounded-full"></div>
        </div>

        {/* Intro */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-3">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2.5" lang="bn">
            <FileCheck className="h-5 w-5 text-[#f47920]" />
            ভূমিকা ও সম্মতি
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed" lang="bn">
            <strong>Future Shop</strong> (শেরপুর, বগুড়া) প্ল্যাটফর্মে যেকোনো অর্ডার প্লেস করার মাধ্যমে আপনি এই পেজে উল্লেখিত সকল শর্ত ও নিয়মাবলী মেনে নিতে সম্মত হচ্ছেন। আমরা সময়ে সময়ে এই শর্তাবলী পরিবর্তন ও পরিমার্জন করার অধিকার রাখি।
          </p>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#f47920]">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ১. সাধারণ নিয়মাবলী ও অ্যাকাউন্ট
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                • সেবা গ্রহণের জন্য গ্রাহককে অবশ্যই সঠিক নাম, সক্রিয় মোবাইল ফোন নম্বর ও সুনির্দিষ্ট ঠিকানা প্রদান করতে হবে।
              </p>
              <p>
                • আপনার অ্যাকাউন্টের পাসওয়ার্ড ও লগইন তথ্যের সুরক্ষার দায়িত্ব একান্তই আপনার। অ্যাকাউন্টে কোনো অননুমোদিত ব্যবহার লক্ষ্য করলে তাৎক্ষণিক আমাদের অবহিত করুন।
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Banknote className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ২. পণ্যের মূল্য ও স্টক প্রাপ্যতা
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                • ওয়েবসাইটে প্রদর্শিত প্রতিটি পণ্যের মূল্য বাংলাদেশি টাকায় (৳) নির্ধারিত এবং ভ্যাট অন্তর্ভুক্ত (প্রযোজ্য ক্ষেত্রে)।
              </p>
              <p>
                • বাজারের দর পরিবর্তনের কারণে যেকোনো সময় পূর্ব নোটিশ ছাড়া পণ্যের মূল্য হালনাগাদ হতে পারে। তবে আপনি যে মূল্যে অর্ডার নিশ্চিত করবেন, সেই মূল্যই কার্যকর থাকবে।
              </p>
              <p>
                • কোনো পণ্য স্টকে না থাকলে বা ভেন্ডর থেকে সরবরাহে ঘাটতি দেখা দিলে আমরা গ্রাহককে অবহিত করে অর্ডার বাতিল বা বিকল্প প্রস্তাব দেওয়ার অধিকার রাখি।
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-700">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৩. ডেলিভারি নীতিমালা
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                • <strong className="text-foreground">শেরপুর, বগুড়া অঞ্চল:</strong> অর্ডার কনফার্মেশনের পর দ্রুততম সময়ের মধ্যে আমাদের নিজস্ব রাইডার মারফত সরাসরি হোম ডেলিভারি প্রদান করা হয়।
              </p>
              <p>
                • <strong className="text-foreground">অন্যান্য জেলা:</strong> কুরিয়ার সার্ভিসের মাধ্যমে দেশের যেকোনো প্রান্তে ২-৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন করা হয়।
              </p>
              <p>
                • প্রাকৃতিক দুর্যোগ, রাজনৈতিক কর্মসূচি বা অনিবার্য কারণে ডেলিভারিতে অনাকাঙ্ক্ষিত বিলম্ব ঘটলে আমরা গ্রাহকের সাথে যোগাযোগ করে নতুন সময় জানিয়ে দেবো।
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৪. পেমেন্ট মেথড (ক্যাশ অন ডেলিভারি)
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                • Future Shop মূলত <strong>ক্যাশ অন ডেলিভারি (COD)</strong> সেবা প্রদান করে। পণ্য হাতে পেয়ে দেখে রাইডারের কাছে নগদ মূল্য পরিশোধ করতে হবে।
              </p>
              <p>
                • বড় কোনো অর্ডারের ক্ষেত্রে প্রয়োজনবোধে ডেলিভারি চার্জ বাবদ অগ্রিম বুকিং গ্রহণ করা হতে পারে।
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৫. অর্ডার বাতিল ও রিটার্ন
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                • পণ্য প্যাকেজিং বা ডেলিভারির উদ্দেশ্যে প্রেরণের পূর্বে গ্রাহক হেল্পলাইনে কল করে অর্ডার বাতিল করতে পারেন।
              </p>
              <p>
                • পণ্য প্রাপ্তির সময় কোনো ত্রুটি, ভাঙা বা ভুল পণ্য পাওয়া গেলে তাৎক্ষণিক ডেলিভারি রাইডারের সামনে রিটার্ন করা যাবে (বিস্তারিত জানতে আমাদের রিটার্ন ও ফেরত নীতি দেখুন)।
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 space-y-4 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground" lang="bn">
                ৬. দায়বদ্ধতার সীমাবদ্ধতা
              </h3>
            </div>
            <div className="space-y-2.5 text-sm md:text-base text-muted-foreground pl-0 md:pl-12 leading-relaxed" lang="bn">
              <p>
                • আমরা স্থানীয় বিশ্বস্ত প্রস্তুতকারক ও ব্র্যান্ডগুলোর পণ্য সরবরাহ করে থাকি। প্রস্তুতকারকের মূল ওয়ারেন্টি ও প্যাকেজিং নির্দেশিকা অনুযায়ী পণ্য ব্যবহৃত হবে।
              </p>
              <p>
                • ওয়েবসাইট ব্যবহারকালে অনাকাঙ্ক্ষিত প্রযুক্তিগত বিভ্রাটের কারণে অর্ডারে কোনো ব্যত্যয় ঘটলে তা সৌহার্দ্যপূর্ণভাবে সমাধানের চেষ্টা করা হবে।
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/20 p-6 md:p-8 space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground" lang="bn">
              শর্তাবলী সংক্রান্ত যেকোনো প্রশ্নে
            </h3>
            <p className="text-sm text-muted-foreground" lang="bn">
              যেকোনো স্পষ্টীকরণ বা সহায়তার জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <MapPin className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">অফিস ঠিকানা</p>
                <p className="text-xs md:text-sm font-semibold text-foreground mt-0.5">
                  Sannalpara, Behind Sonali bank Bus-stand, Sherpur - 5840, Bogura
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <Phone className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">ফোন / হেল্পলাইন</p>
                <a
                  href="tel:01813354648"
                  className="text-xs md:text-sm font-semibold text-foreground hover:text-[#f47920] mt-0.5 block"
                >
                  ০১৮১৩৩৫৪৬৪৮
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border">
              <Mail className="h-5 w-5 text-[#f47920] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground font-medium" lang="bn">ইমেইল</p>
                <a
                  href="mailto:futuremindsbd.info@gmail.com"
                  className="text-xs md:text-sm font-semibold text-foreground hover:text-[#f47920] break-all mt-0.5 block"
                >
                  futuremindsbd.info@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
