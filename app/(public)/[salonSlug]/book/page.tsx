import { BookingStepShell } from "@/modules/bookings/components/booking-step-shell";
import { getSalonBySlug } from "@/modules/salons/lib/queries";

export default async function PublicBookingPage({
  params
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;
  const salon = await getSalonBySlug(salonSlug);
  const isDark = salon?.themeMode === "dark";

  return (
    <main className={isDark ? "min-h-screen bg-[#0F1115] px-4 py-8 text-[#F5F7FA]" : "min-h-screen bg-[#FAF7F2] px-4 py-8 text-[#111827]"}>
      <BookingStepShell
        accentColor={salon?.accentColor ?? "#C8A97E"}
        isDark={isDark}
        logoUrl={salon?.logoUrl}
        salonName={salon?.name ?? salonSlug}
        salonSlug={salonSlug}
      />
    </main>
  );
}
