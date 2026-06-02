export type NotificationChannel = "whatsapp";
export type NotificationStatus = "pending" | "sent" | "failed" | "skipped";
export type WhatsAppProviderName = "disabled" | "twilio" | "meta";

export type NotificationSettings = {
  tenantId: string;
  whatsappEnabled: boolean;
  notifyCustomerOnBooking: boolean;
  notifySalonOnBooking: boolean;
};

export type WhatsAppSettings = {
  tenantId: string;
  provider: WhatsAppProviderName;
  fromNumber?: string | null;
  salonAlertNumber?: string | null;
};

export type NotificationLog = {
  id: string;
  tenantId: string;
  bookingId?: string | null;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  message: string;
  errorMessage?: string | null;
  createdAt: string;
};
