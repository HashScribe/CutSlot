import { PublicFooter } from "@/modules/salons/components/public-footer";
import { PublicNav } from "@/modules/salons/components/public-nav";
import { PublicSalonHero } from "@/modules/salons/components/public-salon-hero";
import { getSalonBySlug } from "@/modules/salons/lib/queries";
import { PublicServicesList } from "@/modules/services/components/public-services-list";
import { listActiveServicesForSalon } from "@/modules/services/lib/queries";

export default async function PublicSalonPage({
  params
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;
  const salon = await getSalonBySlug(salonSlug);
  const accentColor = salon?.accentColor ?? "#C8A97E";
  const services = salon ? await listActiveServicesForSalon(salon.tenantId, salon.id) : [];

  return (
    <main className="dark min-h-screen bg-[#0F1115] text-[#F5F7FA]">
      <PublicNav
        accentColor={accentColor}
        logoUrl={salon?.logoUrl}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
      />
      <PublicSalonHero
        address={salon?.address}
        accentColor={accentColor}
        logoUrl={salon?.logoUrl}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
        serviceCount={services.length}
      />
      <PublicServicesList
        accentColor={accentColor}
        salonSlug={salonSlug}
        services={services.slice(0, 4)}
        showAllServicesLink
      />
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
