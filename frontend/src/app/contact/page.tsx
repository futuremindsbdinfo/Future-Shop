import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "যোগাযোগ | Future Shop",
  description: "আমাদের সাথে যোগাযোগ করতে চান? আমরা আপনার সেবায় নিয়োজিত। অফিসের ঠিকানা, ফোন এবং ইমেল এখানে পাবেন।",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight" lang="bn">
            যোগাযোগ (Contact Us)
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto" lang="bn">
            আমাদের সাথে যোগাযোগ করতে চান? আমরা আপনার সেবায় নিয়োজিত।
          </p>
          <div className="h-1 w-20 bg-[#f47920] mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Contact Details Cards */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground space-y-3">
            <div className="p-3 bg-[#f47920]/10 rounded-full text-[#f47920]">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg" lang="bn">ঠিকানা</h3>
            <p className="text-sm text-muted-foreground leading-relaxed" lang="bn">
              Sannalpara, Behind Sonali Bank Bus-stand, <br />
              Sherpur, Bogura
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground space-y-3">
            <div className="p-3 bg-[#f47920]/10 rounded-full text-[#f47920]">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg" lang="bn">ফোন</h3>
            <a href="tel:01813354648" className="text-sm text-foreground font-semibold hover:text-[#f47920]">
              ০১৮১৩৩৫৪৬৪৮
            </a>
            <p className="text-xs text-muted-foreground" lang="bn">সরাসরি আলোচনার জন্য কল করুন</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card text-card-foreground space-y-3">
            <div className="p-3 bg-[#f47920]/10 rounded-full text-[#f47920]">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg" lang="bn">ইমেইল</h3>
            <a href="mailto:futuremindsbd.info@gmail.com" className="text-sm text-foreground font-semibold hover:text-[#f47920] break-all">
              futuremindsbd.info@gmail.com
            </a>
            <p className="text-xs text-muted-foreground" lang="bn">অভিযোগ বা পরামর্শ পাঠাতে পারেন</p>
          </div>
        </div>

        {/* Delivery / Area Section */}
        <div className="bg-muted/40 p-6 rounded-lg border text-center space-y-3 mt-8">
          <h3 className="font-semibold text-lg text-foreground" lang="bn">সেবার এলাকা</h3>
          <p className="text-2xl font-extrabold text-[#f47920]" lang="bn">
            বগুড়ার শেরপুর অঞ্চল
          </p>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto" lang="bn">
            অর্ডার, ডেলিভারি, পণ্য সম্পর্কিত যেকোনো প্রশ্ন বা সমস্যায় আমাদের ফোন নম্বর অথবা ইমেইল-এর মাধ্যমে যোগাযোগ করুন। আমরা দ্রুততম সময়ে সাড়া দেওয়ার চেষ্টা করব।
          </p>
        </div>
      </div>
    </div>
  );
}
