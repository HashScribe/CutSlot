import { BookingStepShell } from "@/modules/bookings/components/booking-step-shell";

export default async function PublicBookingPage({
  params
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8 text-[#111827]">
      <BookingStepShell salonSlug={salonSlug} />
    </main>
  );
}
