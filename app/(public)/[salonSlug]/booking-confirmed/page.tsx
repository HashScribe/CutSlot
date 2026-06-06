import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PublicFooter } from "@/modules/salons/components/public-footer";
import { PublicNav } from "@/modules/salons/components/public-nav";
import { getSalonBySlug } from "@/modules/salons/lib/queries";

export default async function BookingConfirmedPage({
  params,
  searchParams
}: {
  params: Promise<{ salonSlug: string }>;
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { salonSlug } = await params;
  const query = await searchParams;
  const salon = await getSalonBySlug(salonSlug);
  const accentColor = salon?.accentColor ?? "#C8A97E";
  const status = Array.isArray(query.status) ? query.status[0] : query.status;
  const isPending = status === "pending";

  return (
    <main className="dark min-h-screen bg-[#0F1115] text-[#F5F7FA]">
      <PublicNav
        accentColor={accentColor}
        logoUrl={salon?.logoUrl}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
      />
      <section className="mx-auto flex min-h-[72svh] w-full max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-md border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/20">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-emerald-500/10">
            {isPending ? (
              <Clock3 className="h-8 w-8 text-emerald-400" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-emerald-400" aria-hidden="true" />
            )}
          </span>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            {isPending ? "Request received" : "Confirmed"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white">
            {isPending ? "The salon will confirm soon" : "Your appointment is saved"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/60">
            {isPending
              ? "The salon has your booking request. You will receive an update after the admin approves or declines it."
              : "The salon has your booking details. WhatsApp confirmation will be sent when notifications are enabled."}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              className={buttonVariants({ className: "text-[#111827] hover:opacity-95" })}
              href={`/${salonSlug}/book`}
              style={{ backgroundColor: accentColor }}
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Book another
            </Link>
            <Link
              className={buttonVariants({
                variant: "outline",
                className: "border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
              })}
              href={`/${salonSlug}`}
            >
              Back to salon
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter
        accentColor={accentColor}
        address={salon?.address}
        logoUrl={salon?.logoUrl}
        phone={salon?.phone}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
      />
    </main>
  );
}
