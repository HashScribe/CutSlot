export type NotificationChannel = "whatsapp";
export type NotificationStatus = "pending" | "sent" | "failed" | "skipped";

export type NotificationLog = {
  id: string;
  tenantId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  recipient: string;
  message: string;
  errorMessage?: string | null;
  createdAt: string;
};
