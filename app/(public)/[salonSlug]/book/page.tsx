import { BookingStepShell } from "@/modules/bookings/components/booking-step-shell";
import { PublicFooter } from "@/modules/salons/components/public-footer";
import { PublicNav } from "@/modules/salons/components/public-nav";
import { getSalonBySlug } from "@/modules/salons/lib/queries";
import { listActiveServicesForSalon } from "@/modules/services/lib/queries";
import { listActiveStaffForSalon, listPublicStaffServicesForTenant } from "@/modules/staff/lib/queries";

export default async function PublicBookingPage({
  params,
  searchParams
}: {
  params: Promise<{ salonSlug: string }>;
  searchParams: Promise<{ serviceId?: string | string[] }>;
}) {
  const { salonSlug } = await params;
  const query = await searchParams;
  const salon = await getSalonBySlug(salonSlug);
  const accentColor = salon?.accentColor ?? "#C8A97E";
  const initialServiceId = Array.isArray(query.serviceId) ? query.serviceId[0] : query.serviceId;
  const [services, staff, assignments] = salon
    ? await Promise.all([
        listActiveServicesForSalon(salon.tenantId, salon.id),
        listActiveStaffForSalon(salon.tenantId, salon.id),
        listPublicStaffServicesForTenant(salon.tenantId)
      ])
    : [[], [], []];

  return (
    <main className="dark min-h-screen bg-[#0F1115] text-[#F5F7FA]">
      <PublicNav
        accentColor={accentColor}
        logoUrl={salon?.logoUrl}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
      />
      <BookingStepShell
        accentColor={accentColor}
        assignments={assignments}
        logoUrl={salon?.logoUrl}
        salonId={salon?.id ?? ""}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
        services={services}
        staff={staff}
        initialServiceId={initialServiceId}
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
