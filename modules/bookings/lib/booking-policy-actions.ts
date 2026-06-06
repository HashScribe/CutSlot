"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseUuidSchema } from "@/lib/validations/uuid";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";
import {
  BOOKING_POLICY_LIMITS,
  isValidTimeZone
} from "@/modules/bookings/lib/booking-policy";

export type BookingPolicyActionState = {
  error?: string;
  success?: string;
};

const bookingPolicySchema = z.object({
  salonId: databaseUuidSchema,
  bookingApprovalMode: z.enum(["auto", "manual"]),
  bookingWindowDays: z
    .number()
    .int()
    .min(0)
    .max(BOOKING_POLICY_LIMITS.maxBookingWindowDays)
    .nullable(),
  bookingWindowOpensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  minimumNoticeMinutes: z
    .number()
    .int()
    .min(0)
    .max(BOOKING_POLICY_LIMITS.maxMinimumNoticeMinutes),
  timezone: z.string().trim().min(3).max(80).refine(isValidTimeZone, {
    message: "Use a valid IANA timezone like Asia/Colombo."
  })
});

export async function saveBookingPolicyAction(
  _state: BookingPolicyActionState,
  formData: FormData
): Promise<BookingPolicyActionState> {
  const context = await getAdminTenantContext();
  if (!context) {
    return { error: "You need an active tenant before saving booking rules." };
  }

  const isUnlimited = formData.get("unlimitedFutureBookings") === "on";
  const parsed = bookingPolicySchema.safeParse({
    salonId: formData.get("salonId"),
    bookingApprovalMode: formData.get("bookingApprovalMode"),
    bookingWindowDays: isUnlimited
      ? null
      : Number(formData.get("bookingWindowDays") ?? 0),
    bookingWindowOpensAt: formData.get("bookingWindowOpensAt"),
    minimumNoticeMinutes: Number(formData.get("minimumNoticeMinutes") ?? 0),
    timezone: String(formData.get("timezone") ?? "").trim()
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the booking rules."
    };
  }

  const payload = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data: salon } = await supabase
    .from("salons")
    .select("slug")
    .eq("tenant_id", context.tenant.id)
    .eq("id", payload.salonId)
    .maybeSingle();

  if (!salon?.slug) {
    return { error: "Salon could not be found." };
  }

  const { error } = await supabase
    .from("salons")
    .update({
      booking_window_days: payload.bookingWindowDays,
      booking_window_opens_at: payload.bookingWindowOpensAt,
      booking_approval_mode: payload.bookingApprovalMode,
      minimum_notice_minutes: payload.minimumNoticeMinutes,
      timezone: payload.timezone,
      updated_at: new Date().toISOString()
    })
    .eq("tenant_id", context.tenant.id)
    .eq("id", payload.salonId);

  if (error) {
    return { error: "Could not save booking rules." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/bookings");
  revalidatePath(`/${salon.slug}`);
  revalidatePath(`/${salon.slug}/book`);

  return { success: "Booking rules saved." };
}
