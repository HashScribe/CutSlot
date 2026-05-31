import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PublicFooter } from "@/modules/salons/components/public-footer";
import { PublicNav } from "@/modules/salons/components/public-nav";
import { getSalonBySlug } from "@/modules/salons/lib/queries";
import { PublicServicesList } from "@/modules/services/components/public-services-list";
import { listActiveServicesForSalon } from "@/modules/services/lib/queries";

export default async function PublicServicesPage({
  params
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;
  const salon = await getSalonBySlug(salonSlug);
  const services = salon ? await listActiveServicesForSalon(salon.tenantId, salon.id) : [];
  const accentColor = salon?.accentColor ?? "#C8A97E";

  return (
    <main className="dark min-h-screen bg-[#0F1115] text-[#F5F7FA]">
      <PublicNav
        accentColor={accentColor}
        logoUrl={salon?.logoUrl}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
      />
      <section className="border-y border-white/10 bg-[#11141A]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em]" style={{ color: accentColor }}>
              {salon?.name ?? salonSlug}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-white md:text-6xl">
              Services made for your next visit
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
              Browse the full menu, then reserve a time that is actually available.
            </p>
          </div>
          <Link
            className={buttonVariants({
              className: "h-11 text-[#111827] shadow-xl shadow-black/20 hover:opacity-95"
            })}
            href={`/${salonSlug}/book`}
            style={{ backgroundColor: accentColor }}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Book appointment
          </Link>
        </div>
      </section>
      <PublicServicesList accentColor={accentColor} salonSlug={salonSlug} services={services} />
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
