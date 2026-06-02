import { Bell, MessageCircle } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveNotificationSettingsAction } from "@/modules/notifications/lib/actions";
import type { NotificationLog, NotificationSettings, WhatsAppSettings } from "@/modules/notifications/lib/types";

const statusVariant = {
  sent: "success",
  failed: "danger",
  skipped: "muted",
  pending: "default"
} as const;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function NotificationSettingsPanel({
  logs,
  notificationSettings,
  whatsappSettings
}: {
  logs: NotificationLog[];
  notificationSettings: NotificationSettings;
  whatsappSettings: WhatsAppSettings;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
            Customer feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveNotificationSettingsAction} className="space-y-4">
            <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
              <input
                className="mt-0.5 h-4 w-4 accent-primary"
                defaultChecked={notificationSettings.whatsappEnabled}
                name="whatsappEnabled"
                type="checkbox"
              />
              <span>
                <span className="block font-medium">Enable WhatsApp notifications</span>
                <span className="mt-1 block text-muted-foreground">
                  Booking changes will still be logged when this is off.
                </span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                className="h-4 w-4 accent-primary"
                defaultChecked={notificationSettings.notifyCustomerOnBooking}
                name="notifyCustomerOnBooking"
                type="checkbox"
              />
              Notify customers for booking confirmations, reschedules, and status changes
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                className="h-4 w-4 accent-primary"
                defaultChecked={notificationSettings.notifySalonOnBooking}
                name="notifySalonOnBooking"
                type="checkbox"
              />
              Notify salon on new bookings
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="whatsapp-provider">
                Provider
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                defaultValue={whatsappSettings.provider}
                id="whatsapp-provider"
                name="provider"
              >
                <option value="disabled">Disabled</option>
                <option value="twilio">Twilio WhatsApp</option>
                <option value="meta">Meta WhatsApp</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="whatsapp-from-number">
                From number
              </label>
              <Input
                defaultValue={whatsappSettings.fromNumber ?? ""}
                id="whatsapp-from-number"
                name="fromNumber"
                placeholder="+14155238886"
              />
              <p className="text-xs text-muted-foreground">
                Twilio uses a WhatsApp sender number. Meta uses the phone number ID from environment.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="salon-alert-number">
                Salon alert number
              </label>
              <Input
                defaultValue={whatsappSettings.salonAlertNumber ?? ""}
                id="salon-alert-number"
                name="salonAlertNumber"
                placeholder="+94770000000"
              />
            </div>

            <SubmitButton className="w-full">Save notification settings</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
            Notification log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
              No notification events yet.
            </p>
          ) : null}
          {logs.map((log) => (
            <div key={log.id} className="rounded-md border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{log.recipient}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                </div>
                <Badge variant={statusVariant[log.status]}>{log.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{log.message}</p>
              {log.errorMessage ? (
                <p className="mt-2 text-xs text-muted-foreground">{log.errorMessage}</p>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
