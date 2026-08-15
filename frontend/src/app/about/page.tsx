import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে | Future Shop",
  description: "Future Shop বগুড়ার শেরপুর অঞ্চলের একটি অনলাইন শপিং প্ল্যাটফর্ম, যেখানে আপনি ঘরে বসেই আপনার প্রয়োজনীয় পণ্য অর্ডার করতে পারবেন।",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            আমাদের সম্পর্কে
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto" lang="bn">
            Future Shop — আপনার বিশ্বস্ত অনলাইন বাজার
          </p>
          <div className="h-1 w-20 bg-[#f47920] mx-auto rounded"></div>
        </div>

        <div className="prose max-w-none text-muted-foreground space-y-6 text-base md:text-lg leading-relaxed" lang="bn">
          <p>
            <strong>Future Shop</strong> বগুড়ার শেরপুর অঞ্চলের একটি অনলাইন শপিং প্ল্যাটফর্ম, যেখানে আপনি ঘরে বসেই আপনার প্রয়োজনীয় পণ্য অর্ডার করতে পারবেন। আমাদের লক্ষ্য একটাই — <strong>&ldquo;বাজারে নয়, বাজার আসবে আপনার ঘরে।&rdquo;</strong>
          </p>

          <p>
            আমরা স্থানীয় বিশ্বস্ত বিক্রেতাদের সাথে কাজ করি, যাতে আপনি পান খাঁটি ও মানসম্পন্ন পণ্য, ন্যায্য দামে। নিত্যপ্রয়োজনীয় মুদিপণ্য থেকে শুরু করে আরও অনেক কিছু — সবই এখন আপনার হাতের মুঠোয়।
          </p>

          <div className="bg-muted/45 p-6 rounded-lg border space-y-4">
            <h2 className="text-xl font-bold text-foreground" lang="bn">কেন Future Shop?</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm md:text-base">
              <li className="flex items-center gap-2">
                <span className="text-[#f47920] font-bold">✓</span> স্থানীয় ও বিশ্বস্ত বিক্রেতা
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#f47920] font-bold">✓</span> খাঁটি ও মানসম্পন্ন পণ্য
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#f47920] font-bold">✓</span> ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা পরিশোধ)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#f47920] font-bold">✓</span> দ্রুত হোম ডেলিভারি (বগুড়ার শেরপুর)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#f47920] font-bold">✓</span> সহজ অর্ডার প্রক্রিয়া
              </li>
            </ul>
          </div>

          <p>
            আমরা বিশ্বাস করি, প্রযুক্তির মাধ্যমে স্থানীয় বাজারকে আপনার দোরগোড়ায় পৌঁছে দেওয়া সম্ভব। Future Shop সেই বিশ্বাসেরই বাস্তব রূপ।
          </p>

          <div className="pt-6 border-t">
            <p className="text-sm font-medium text-foreground">
              📍 যোগাযোগ: Sannalpara, Behind Sonali bank Bus-stand, Sherpur - 5840, Bogura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
