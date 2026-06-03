"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

export type NotificationSettingsActionState = {
  error?: string;
  success?: string;
};

const notificationSettingsSchema = z.object({
  whatsappEnabled: z.boolean(),
  notifyCustomerOnBooking: z.boolean(),
  notifySalonOnBooking: z.boolean(),
  provider: z.enum(["disabled", "twilio", "meta"]),
  fromNumber: z.string().max(80).optional(),
  salonAlertNumber: z.string().max(80).optional()
});

export async function saveNotificationSettingsAction(
  _state: NotificationSettingsActionState,
  formData: FormData
): Promise<NotificationSettingsActionState> {
  const context = await getAdminTenantContext();
  if (!context) {
    return { error: "You need an active tenant before saving notifications." };
  }

  const parsed = notificationSettingsSchema.safeParse({
    whatsappEnabled: formData.get("whatsappEnabled") === "on",
    notifyCustomerOnBooking: formData.get("notifyCustomerOnBooking") === "on",
    notifySalonOnBooking: formData.get("notifySalonOnBooking") === "on",
    provider: formData.get("provider") || "disabled",
    fromNumber: String(formData.get("fromNumber") ?? "").trim() || undefined,
    salonAlertNumber: String(formData.get("salonAlertNumber") ?? "").trim() || undefined
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the notification settings."
    };
  }

  const payload = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { error: notificationError } = await supabase.from("notification_settings").upsert({
    tenant_id: context.tenant.id,
    whatsapp_enabled: payload.whatsappEnabled,
    notify_customer_on_booking: payload.notifyCustomerOnBooking,
    notify_salon_on_booking: payload.notifySalonOnBooking,
    updated_at: new Date().toISOString()
  });

  if (notificationError) {
    return { error: "Could not save notification settings." };
  }

  const { error: whatsappError } = await supabase.from("whatsapp_settings").upsert({
    tenant_id: context.tenant.id,
    provider: payload.provider,
    from_number: payload.fromNumber ?? null,
    salon_alert_number: payload.salonAlertNumber ?? null,
    updated_at: new Date().toISOString()
  });

  if (whatsappError) {
    return { error: "Could not save WhatsApp settings." };
  }

  revalidatePath("/admin/settings");
  return { success: "Notification settings saved." };
}
