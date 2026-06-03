"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createBookingSchema } from "@/lib/validations/booking";
import { databaseUuidSchema } from "@/lib/validations/uuid";
import { getAvailabilityForSalon } from "@/modules/availability/lib/queries";
import {
  validateBookingDateAgainstPolicy,
  validateBookingSlotAgainstPolicy
} from "@/modules/bookings/lib/booking-policy";
import {
  sendCustomerBookingNotification,
  sendSalonNewBookingNotification,
  type BookingNotificationEvent
} from "@/modules/notifications/lib/booking-notifications";
import { getPrimarySalonForTenant, getSalonBySlug } from "@/modules/salons/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";
import type { BookingStatus } from "./types";

export type PublicBookingState = {
  error?: string;
};

const publicBookingSchema = createBookingSchema.extend({
  salonSlug: z.string().min(2),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const adminBookingSchema = createBookingSchema.extend({
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

const bookingStatusSchema = z.object({
  bookingId: databaseUuidSchema,
  status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"])
});

const rescheduleBookingSchema = z.object({
  bookingId: databaseUuidSchema,
  serviceId: databaseUuidSchema,
  staffId: databaseUuidSchema,
  startTime: z.string().datetime(),
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

  const datePolicy = validateBookingDateAgainstPolicy({
    date: input.bookingDate,
    policy: salon
  });
  if (!datePolicy.ok) {
    return { error: datePolicy.error };
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

  const slotPolicy = validateBookingSlotAgainstPolicy({
    date: input.bookingDate,
    policy: salon,
    slotStart: selectedSlot.start
  });
  if (!slotPolicy.ok) {
    return { error: slotPolicy.error };
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

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      tenant_id: salon.tenantId,
      salon_id: salon.id,
      customer_id: customer.id,
      staff_id: input.staffId,
      service_id: input.serviceId,
      start_time: selectedSlot.start.toISOString(),
      end_time: selectedSlot.end.toISOString(),
      status: "confirmed",
      notes: input.notes ?? null
    })
    .select("id")
    .single();

  if (bookingError) {
    return { error: "That slot was just taken. Please choose another time." };
  }

  if (booking?.id) {
    await sendCustomerBookingNotification({ bookingId: booking.id, event: "created" });
    await sendSalonNewBookingNotification({ bookingId: booking.id });
  }

  redirect(`/${input.salonSlug}/booking-confirmed`);
}

export type AdminBookingActionState = {
  error?: string;
  success?: string;
};

function revalidateAdminBookingSurfaces() {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/customers");
}

async function getSelectedAvailabilitySlot({
  salonSlug,
  serviceId,
  staffId,
  date,
  startTime
}: {
  salonSlug: string;
  serviceId: string;
  staffId: string;
  date: string;
  startTime: string;
}) {
  const availability = await getAvailabilityForSalon({
    salonSlug,
    serviceId,
    staffId,
    date
  });

  return availability
    .flatMap((item) => item.slots)
    .find((slot) => slot.staffId === staffId && slot.start.toISOString() === startTime);
}

export async function createAdminBookingAction(
  _state: AdminBookingActionState,
  formData: FormData
): Promise<AdminBookingActionState> {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;

  if (!context || !salon) {
    return { error: "Create a salon before adding bookings." };
  }

  const parsed = adminBookingSchema.safeParse({
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

  if (input.salonId !== salon.id) {
    return { error: "Salon mismatch. Refresh and try again." };
  }

  const datePolicy = validateBookingDateAgainstPolicy({
    date: input.bookingDate,
    policy: salon
  });
  if (!datePolicy.ok) {
    return { error: datePolicy.error };
  }

  const selectedSlot = await getSelectedAvailabilitySlot({
    salonSlug: salon.slug,
    serviceId: input.serviceId,
    staffId: input.staffId,
    date: input.bookingDate,
    startTime: input.startTime
  });

  if (!selectedSlot) {
    return { error: "That time is no longer available." };
  }

  const slotPolicy = validateBookingSlotAgainstPolicy({
    date: input.bookingDate,
    policy: salon,
    slotStart: selectedSlot.start
  });
  if (!slotPolicy.ok) {
    return { error: slotPolicy.error };
  }

  const supabase = await createSupabaseServerClient();
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        tenant_id: context.tenant.id,
        salon_id: salon.id,
        name: input.customerName,
        phone: input.customerPhone,
        updated_at: new Date().toISOString()
      },
      { onConflict: "salon_id,phone" }
    )
    .select("id")
    .single();

  if (customerError || !customer?.id) {
    return { error: "Could not save customer details." };
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      tenant_id: context.tenant.id,
      salon_id: salon.id,
      customer_id: customer.id,
      staff_id: input.staffId,
      service_id: input.serviceId,
      start_time: selectedSlot.start.toISOString(),
      end_time: selectedSlot.end.toISOString(),
      status: "confirmed",
      notes: input.notes ?? null
    })
    .select("id")
    .single();

  if (bookingError) {
    return { error: "That slot was just taken. Choose another time." };
  }

  if (booking?.id) {
    await sendCustomerBookingNotification({ bookingId: booking.id, event: "created" });
    await sendSalonNewBookingNotification({ bookingId: booking.id });
  }

  revalidateAdminBookingSurfaces();
  return { success: "Booking created." };
}

export async function updateBookingStatusAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const parsed = bookingStatusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    status: formData.get("status")
  });

  if (!parsed.success) return;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      status: parsed.data.status satisfies BookingStatus,
      updated_at: new Date().toISOString()
    })
    .eq("tenant_id", context.tenant.id)
    .eq("id", parsed.data.bookingId);

  if (error) return;

  const notificationEvent: Partial<Record<BookingStatus, BookingNotificationEvent>> = {
    confirmed: "confirmed",
    cancelled: "cancelled",
    completed: "completed",
    no_show: "no_show"
  };
  const event = notificationEvent[parsed.data.status];

  if (event) {
    await sendCustomerBookingNotification({ bookingId: parsed.data.bookingId, event });
  }

  revalidateAdminBookingSurfaces();
}

export async function rescheduleBookingAction(
  _state: AdminBookingActionState,
  formData: FormData
): Promise<AdminBookingActionState> {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;

  if (!context || !salon) {
    return { error: "Create a salon before rescheduling bookings." };
  }

  const parsed = rescheduleBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
    serviceId: formData.get("serviceId"),
    staffId: formData.get("staffId"),
    startTime: formData.get("startTime"),
    bookingDate: formData.get("bookingDate")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Choose a new time." };
  }

  const input = parsed.data;
  const datePolicy = validateBookingDateAgainstPolicy({
    date: input.bookingDate,
    policy: salon
  });
  if (!datePolicy.ok) {
    return { error: datePolicy.error };
  }

  const selectedSlot = await getSelectedAvailabilitySlot({
    salonSlug: salon.slug,
    serviceId: input.serviceId,
    staffId: input.staffId,
    date: input.bookingDate,
    startTime: input.startTime
  });

  if (!selectedSlot) {
    return { error: "That time is no longer available." };
  }

  const slotPolicy = validateBookingSlotAgainstPolicy({
    date: input.bookingDate,
    policy: salon,
    slotStart: selectedSlot.start
  });
  if (!slotPolicy.ok) {
    return { error: slotPolicy.error };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      start_time: selectedSlot.start.toISOString(),
      end_time: selectedSlot.end.toISOString(),
      status: "confirmed",
      updated_at: new Date().toISOString()
    })
    .eq("tenant_id", context.tenant.id)
    .eq("salon_id", salon.id)
    .eq("id", input.bookingId);

  if (error) {
    return { error: "Could not reschedule. The slot may have just been taken." };
  }

  await sendCustomerBookingNotification({ bookingId: input.bookingId, event: "rescheduled" });

  revalidateAdminBookingSurfaces();
  return { success: "Booking rescheduled." };
}
