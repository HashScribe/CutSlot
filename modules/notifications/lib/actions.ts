"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

const notificationSettingsSchema = z.object({
  whatsappEnabled: z.boolean(),
  notifyCustomerOnBooking: z.boolean(),
  notifySalonOnBooking: z.boolean(),
  provider: z.enum(["disabled", "twilio", "meta"]),
  fromNumber: z.string().max(80).optional(),
  salonAlertNumber: z.string().max(80).optional()
});

export async function saveNotificationSettingsAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const parsed = notificationSettingsSchema.parse({
    whatsappEnabled: formData.get("whatsappEnabled") === "on",
    notifyCustomerOnBooking: formData.get("notifyCustomerOnBooking") === "on",
    notifySalonOnBooking: formData.get("notifySalonOnBooking") === "on",
    provider: formData.get("provider") || "disabled",
    fromNumber: String(formData.get("fromNumber") ?? "").trim() || undefined,
    salonAlertNumber: String(formData.get("salonAlertNumber") ?? "").trim() || undefined
  });
  const supabase = await createSupabaseServerClient();

  await supabase.from("notification_settings").upsert({
    tenant_id: context.tenant.id,
    whatsapp_enabled: parsed.whatsappEnabled,
    notify_customer_on_booking: parsed.notifyCustomerOnBooking,
    notify_salon_on_booking: parsed.notifySalonOnBooking,
    updated_at: new Date().toISOString()
  });

  await supabase.from("whatsapp_settings").upsert({
    tenant_id: context.tenant.id,
    provider: parsed.provider,
    from_number: parsed.fromNumber ?? null,
    salon_alert_number: parsed.salonAlertNumber ?? null,
    updated_at: new Date().toISOString()
  });

  revalidatePath("/admin/settings");
}
