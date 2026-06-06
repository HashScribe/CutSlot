import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createWhatsAppProvider } from "@/modules/whatsapp/lib/provider";
import type { BookingStatus } from "@/modules/bookings/lib/types";

export type BookingNotificationEvent =
  | "created"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed"
  | "no_show"
  | "rescheduled";

type BookingNotificationRow = {
  id: string;
  tenant_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  customers:
    | {
        name: string;
        phone: string;
      }
    | {
        name: string;
        phone: string;
      }[]
    | null;
  services:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
  staff:
    | {
        display_name: string;
      }
    | {
        display_name: string;
      }[]
    | null;
  salons:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

type NotificationSettingsRow = {
  whatsapp_enabled: boolean;
  notify_customer_on_booking: boolean;
  notify_salon_on_booking: boolean;
};

type WhatsAppSettingsRow = {
  provider: "disabled" | "twilio" | "meta";
  from_number: string | null;
  salon_alert_number: string | null;
};

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function buildCustomerMessage(event: BookingNotificationEvent, booking: BookingNotificationRow) {
  const customer = firstRelation(booking.customers);
  const service = firstRelation(booking.services);
  const staff = firstRelation(booking.staff);
  const salon = firstRelation(booking.salons);
  const customerName = customer?.name ?? "there";
  const salonName = salon?.name ?? "the salon";
  const serviceName = service?.name ?? "your service";
  const staffName = staff?.display_name ?? "your stylist";
  const time = formatDateTime(booking.start_time);

  if (event === "created") {
    if (booking.status === "pending") {
      return `Hi ${customerName}, your booking request at ${salonName} for ${time} with ${staffName} for ${serviceName} has been received. The salon will confirm it soon.`;
    }

    return `Hi ${customerName}, your booking at ${salonName} is confirmed for ${time} with ${staffName} for ${serviceName}.`;
  }

  if (event === "confirmed") {
    return `Hi ${customerName}, your booking at ${salonName} is confirmed for ${time}.`;
  }

  if (event === "cancelled") {
    return `Hi ${customerName}, your booking at ${salonName} for ${time} has been cancelled.`;
  }

  if (event === "declined") {
    return `Hi ${customerName}, your booking request at ${salonName} for ${time} was declined. Please contact the salon to choose another time.`;
  }

  if (event === "rescheduled") {
    return `Hi ${customerName}, your booking at ${salonName} has been rescheduled to ${time} with ${staffName}.`;
  }

  if (event === "completed") {
    return `Hi ${customerName}, your visit at ${salonName} has been marked completed. Thank you.`;
  }

  return `Hi ${customerName}, your booking at ${salonName} for ${time} has been marked as no-show. Please contact the salon if this is incorrect.`;
}

function buildSalonMessage(booking: BookingNotificationRow) {
  const customer = firstRelation(booking.customers);
  const service = firstRelation(booking.services);
  const staff = firstRelation(booking.staff);
  const salon = firstRelation(booking.salons);

  if (booking.status === "pending") {
    return `New booking request at ${salon?.name ?? "your salon"}: ${customer?.name ?? "Customer"} for ${service?.name ?? "a service"} with ${staff?.display_name ?? "staff"} on ${formatDateTime(booking.start_time)}. Phone: ${customer?.phone ?? "not provided"}. Approval is required.`;
  }

  return `New confirmed booking at ${salon?.name ?? "your salon"}: ${customer?.name ?? "Customer"} for ${service?.name ?? "a service"} with ${staff?.display_name ?? "staff"} on ${formatDateTime(booking.start_time)}. Phone: ${customer?.phone ?? "not provided"}.`;
}

async function insertLog({
  bookingId,
  errorMessage,
  message,
  recipient,
  status,
  tenantId
}: {
  bookingId: string;
  errorMessage?: string | null;
  message: string;
  recipient: string;
  status: "sent" | "failed" | "skipped";
  tenantId: string;
}) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("notification_logs").insert({
      tenant_id: tenantId,
      booking_id: bookingId,
      channel: "whatsapp",
      status,
      recipient,
      message,
      error_message: errorMessage ?? null
    });
  } catch {
    // Notification logging must never block booking operations.
  }
}

export async function sendCustomerBookingNotification({
  bookingId,
  event
}: {
  bookingId: string;
  event: BookingNotificationEvent;
}) {
  let supabase;

  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return;
  }

  const { data: bookingData } = await supabase
    .from("bookings")
    .select(
      `
        id,
        tenant_id,
        start_time,
        end_time,
        status,
        notes,
        customers(name, phone),
        services(name),
        staff(display_name),
        salons(name)
      `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!bookingData) {
    return;
  }

  const booking = bookingData as unknown as BookingNotificationRow;
  const customer = firstRelation(booking.customers);

  if (!customer?.phone) {
    return;
  }

  const message = buildCustomerMessage(event, booking);
  const [{ data: notificationSettings }, { data: whatsappSettings }] = await Promise.all([
    supabase
      .from("notification_settings")
      .select("whatsapp_enabled, notify_customer_on_booking")
      .eq("tenant_id", booking.tenant_id)
      .maybeSingle(),
    supabase
      .from("whatsapp_settings")
      .select("provider, from_number")
      .eq("tenant_id", booking.tenant_id)
      .maybeSingle()
  ]);
  const notificationRow = notificationSettings as NotificationSettingsRow | null;
  const whatsappRow = whatsappSettings as WhatsAppSettingsRow | null;

  if (!notificationRow?.whatsapp_enabled || !notificationRow.notify_customer_on_booking) {
    await insertLog({
      bookingId,
      message,
      recipient: customer.phone,
      status: "skipped",
      tenantId: booking.tenant_id,
      errorMessage: "Customer WhatsApp notifications are disabled."
    });
    return;
  }

  if (!whatsappRow || whatsappRow.provider === "disabled") {
    await insertLog({
      bookingId,
      message,
      recipient: customer.phone,
      status: "skipped",
      tenantId: booking.tenant_id,
      errorMessage: "WhatsApp provider is disabled."
    });
    return;
  }

  try {
    const provider = createWhatsAppProvider(whatsappRow.provider);
    await provider.sendMessage({
      tenantId: booking.tenant_id,
      bookingId,
      to: customer.phone,
      from: whatsappRow.from_number,
      body: message
    });
    await insertLog({
      bookingId,
      message,
      recipient: customer.phone,
      status: "sent",
      tenantId: booking.tenant_id
    });
  } catch (error) {
    await insertLog({
      bookingId,
      message,
      recipient: customer.phone,
      status: "failed",
      tenantId: booking.tenant_id,
      errorMessage: error instanceof Error ? error.message : "WhatsApp send failed."
    });
  }
}

export async function sendSalonNewBookingNotification({ bookingId }: { bookingId: string }) {
  let supabase;

  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return;
  }

  const { data: bookingData } = await supabase
    .from("bookings")
    .select(
      `
        id,
        tenant_id,
        start_time,
        end_time,
        status,
        notes,
        customers(name, phone),
        services(name),
        staff(display_name),
        salons(name)
      `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (!bookingData) return;

  const booking = bookingData as unknown as BookingNotificationRow;
  const message = buildSalonMessage(booking);
  const [{ data: notificationSettings }, { data: whatsappSettings }] = await Promise.all([
    supabase
      .from("notification_settings")
      .select("whatsapp_enabled, notify_salon_on_booking")
      .eq("tenant_id", booking.tenant_id)
      .maybeSingle(),
    supabase
      .from("whatsapp_settings")
      .select("provider, from_number, salon_alert_number")
      .eq("tenant_id", booking.tenant_id)
      .maybeSingle()
  ]);
  const notificationRow = notificationSettings as NotificationSettingsRow | null;
  const whatsappRow = whatsappSettings as WhatsAppSettingsRow | null;
  const recipient = whatsappRow?.salon_alert_number;

  if (!recipient) {
    return;
  }

  if (!notificationRow?.whatsapp_enabled || !notificationRow.notify_salon_on_booking) {
    await insertLog({
      bookingId,
      message,
      recipient,
      status: "skipped",
      tenantId: booking.tenant_id,
      errorMessage: "Salon WhatsApp notifications are disabled."
    });
    return;
  }

  if (!whatsappRow || whatsappRow.provider === "disabled") {
    await insertLog({
      bookingId,
      message,
      recipient,
      status: "skipped",
      tenantId: booking.tenant_id,
      errorMessage: "WhatsApp provider is disabled."
    });
    return;
  }

  try {
    const provider = createWhatsAppProvider(whatsappRow.provider);
    await provider.sendMessage({
      tenantId: booking.tenant_id,
      bookingId,
      to: recipient,
      from: whatsappRow.from_number,
      body: message
    });
    await insertLog({
      bookingId,
      message,
      recipient,
      status: "sent",
      tenantId: booking.tenant_id
    });
  } catch (error) {
    await insertLog({
      bookingId,
      message,
      recipient,
      status: "failed",
      tenantId: booking.tenant_id,
      errorMessage: error instanceof Error ? error.message : "WhatsApp send failed."
    });
  }
}
