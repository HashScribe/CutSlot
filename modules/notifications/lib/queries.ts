import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NotificationLog, NotificationSettings, WhatsAppProviderName, WhatsAppSettings } from "./types";

type NotificationSettingsRow = {
  tenant_id: string;
  whatsapp_enabled: boolean;
  notify_customer_on_booking: boolean;
  notify_salon_on_booking: boolean;
};

type WhatsAppSettingsRow = {
  tenant_id: string;
  provider: WhatsAppProviderName;
  from_number: string | null;
  salon_alert_number: string | null;
};

type NotificationLogRow = {
  id: string;
  tenant_id: string;
  booking_id: string | null;
  channel: "whatsapp";
  status: "pending" | "sent" | "failed" | "skipped";
  recipient: string;
  message: string;
  error_message: string | null;
  created_at: string;
};

export const getNotificationSettingsForTenant = cache(async (tenantId: string) => {
  const supabase = await createSupabaseServerClient();
  const [{ data: notificationData }, { data: whatsappData }] = await Promise.all([
    supabase
      .from("notification_settings")
      .select("tenant_id, whatsapp_enabled, notify_customer_on_booking, notify_salon_on_booking")
      .eq("tenant_id", tenantId)
      .maybeSingle(),
    supabase
      .from("whatsapp_settings")
      .select("tenant_id, provider, from_number, salon_alert_number")
      .eq("tenant_id", tenantId)
      .maybeSingle()
  ]);

  const notificationRow = notificationData as NotificationSettingsRow | null;
  const whatsappRow = whatsappData as WhatsAppSettingsRow | null;

  return {
    notificationSettings: {
      tenantId,
      whatsappEnabled: notificationRow?.whatsapp_enabled ?? false,
      notifyCustomerOnBooking: notificationRow?.notify_customer_on_booking ?? true,
      notifySalonOnBooking: notificationRow?.notify_salon_on_booking ?? true
    } satisfies NotificationSettings,
    whatsappSettings: {
      tenantId,
      provider: whatsappRow?.provider ?? "disabled",
      fromNumber: whatsappRow?.from_number ?? null,
      salonAlertNumber: whatsappRow?.salon_alert_number ?? null
    } satisfies WhatsAppSettings
  };
});

export const listNotificationLogsForTenant = cache(async (tenantId: string, limit = 20): Promise<NotificationLog[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("notification_logs")
    .select("id, tenant_id, booking_id, channel, status, recipient, message, error_message, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as NotificationLogRow[]).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    bookingId: row.booking_id,
    channel: row.channel,
    status: row.status,
    recipient: row.recipient,
    message: row.message,
    errorMessage: row.error_message,
    createdAt: row.created_at
  }));
});
