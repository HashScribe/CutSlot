import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function BookingConfirmedPage({
  params
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF7F2] px-4 text-[#111827]">
      <section className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-semibold tracking-normal">Booking confirmed</h1>
        <p className="mt-3 text-sm text-gray-600">
          Your appointment is saved. WhatsApp confirmation will be sent when notifications are enabled for this salon.
        </p>
        <Link
          className={buttonVariants({ className: "mt-6 bg-[#111827] text-white hover:bg-[#111827]/90" })}
          href={`/${salonSlug}`}
        >
          Back to salon
        </Link>
      </section>
    </main>
  );
}
