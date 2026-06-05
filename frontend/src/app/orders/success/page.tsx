import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600" />

      <h1 className="mt-6 text-2xl font-bold" lang="bn">
        আপনার অর্ডার সফল হয়েছে!
      </h1>

      {order && (
        <p className="mt-2 text-muted-foreground">
          <span lang="bn">অর্ডার নম্বর:</span>{" "}
          <span className="font-mono font-semibold text-foreground">{order}</span>
        </p>
      )}

      <p className="mt-4 text-sm text-muted-foreground" lang="bn">
        আমরা আপনার অর্ডারটি পেয়েছি এবং শীঘ্রই প্রক্রিয়া শুরু করব। ধন্যবাদ!
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button nativeButton={false} render={<Link href="/orders" />} className="bg-[#f47920] hover:bg-[#e56910]">
          <span lang="bn">আমার অর্ডার দেখুন</span>
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          <span lang="bn">কেনাকাটা চালিয়ে যান</span>
        </Button>
      </div>
    </div>
  );
}
