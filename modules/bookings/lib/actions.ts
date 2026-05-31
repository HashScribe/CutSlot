"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createBookingSchema } from "@/lib/validations/booking";
import { getAvailabilityForSalon } from "@/modules/availability/lib/queries";
import { getSalonBySlug } from "@/modules/salons/lib/queries";

export type PublicBookingState = {
  error?: string;
};

const publicBookingSchema = createBookingSchema.extend({
  salonSlug: z.string().min(2),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function createPublicBookingAction(
  _state: PublicBookingState,
  formData: FormData
): Promise<PublicBookingState> {
  const parsed = publicBookingSchema.safeParse({
    salonSlug: formData.get("salonSlug"),
    salonId: formData.get("salonId"),
    serviceId: formData.get("serviceId"),
    staffId: formData.get("staffId"),
    startTime: formData.get("startTime"),
    bookingDate: formData.get("bookingDate"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    notes: String(formData.get("notes") ?? "").trim() || undefined
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the booking details." };
  }

  const input = parsed.data;
  const salon = await getSalonBySlug(input.salonSlug);

  if (!salon || salon.id !== input.salonId) {
    return { error: "Salon could not be found." };
  }

  const availability = await getAvailabilityForSalon({
    salonSlug: input.salonSlug,
    serviceId: input.serviceId,
    staffId: input.staffId,
    date: input.bookingDate
  });
  const selectedSlot = availability
    .flatMap((item) => item.slots)
    .find((slot) => slot.staffId === input.staffId && slot.start.toISOString() === input.startTime);

  if (!selectedSlot) {
    return { error: "That time is no longer available. Please choose another slot." };
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return {
      error: "Booking is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to your environment and restart the dev server."
    };
  }
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        tenant_id: salon.tenantId,
        salon_id: salon.id,
        name: input.customerName,
        phone: input.customerPhone,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "salon_id,phone"
      }
    )
    .select("id")
    .single();

  if (customerError || !customer?.id) {
    return { error: "Could not save customer details." };
  }

  const { error: bookingError } = await supabase.from("bookings").insert({
    tenant_id: salon.tenantId,
    salon_id: salon.id,
    customer_id: customer.id,
    staff_id: input.staffId,
    service_id: input.serviceId,
    start_time: selectedSlot.start.toISOString(),
    end_time: selectedSlot.end.toISOString(),
    status: "confirmed",
    notes: input.notes ?? null
  });

  if (bookingError) {
    return { error: "That slot was just taken. Please choose another time." };
  }

  redirect(`/${input.salonSlug}/booking-confirmed`);
}
