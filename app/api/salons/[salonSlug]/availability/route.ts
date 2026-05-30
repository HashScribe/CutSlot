import { NextResponse } from "next/server";
import { getAvailabilityForSalon } from "@/modules/availability/lib/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ salonSlug: string }> }
) {
  const { salonSlug } = await params;
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  const staffId = searchParams.get("staffId") ?? undefined;

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "serviceId and date are required." },
      { status: 400 }
    );
  }

  try {
    const availability = await getAvailabilityForSalon({
      salonSlug,
      serviceId,
      date,
      staffId
    });

    return NextResponse.json({
      availability: availability.map((staff) => ({
        staffId: staff.staffId,
        staffName: staff.staffName,
        slots: staff.slots.map((slot) => ({
          staffId: slot.staffId,
          start: slot.start.toISOString(),
          end: slot.end.toISOString()
        }))
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load availability." },
      { status: 400 }
    );
  }
}
