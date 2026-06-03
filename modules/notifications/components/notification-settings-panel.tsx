"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveNotificationSettingsAction } from "@/modules/notifications/lib/actions";
import type {
  NotificationLog,
  NotificationSettings,
  WhatsAppProviderName,
  WhatsAppSettings
} from "@/modules/notifications/lib/types";

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
  const router = useRouter();
  const [state, formAction] = useActionState(saveNotificationSettingsAction, {});
  const [whatsappEnabled, setWhatsappEnabled] = useState(notificationSettings.whatsappEnabled);
  const [notifyCustomer, setNotifyCustomer] = useState(notificationSettings.notifyCustomerOnBooking);
  const [notifySalon, setNotifySalon] = useState(notificationSettings.notifySalonOnBooking);
  const [provider, setProvider] = useState<WhatsAppProviderName>(whatsappSettings.provider);
  const [fromNumber, setFromNumber] = useState(whatsappSettings.fromNumber ?? "");
  const [salonAlertNumber, setSalonAlertNumber] = useState(whatsappSettings.salonAlertNumber ?? "");

  useEffect(() => {
    setWhatsappEnabled(notificationSettings.whatsappEnabled);
    setNotifyCustomer(notificationSettings.notifyCustomerOnBooking);
    setNotifySalon(notificationSettings.notifySalonOnBooking);
    setProvider(whatsappSettings.provider);
    setFromNumber(whatsappSettings.fromNumber ?? "");
    setSalonAlertNumber(whatsappSettings.salonAlertNumber ?? "");
  }, [
    notificationSettings.notifyCustomerOnBooking,
    notificationSettings.notifySalonOnBooking,
    notificationSettings.whatsappEnabled,
    whatsappSettings.fromNumber,
    whatsappSettings.provider,
    whatsappSettings.salonAlertNumber
  ]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

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
          <form action={formAction} className="space-y-4">
            <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
              <input
                className="mt-0.5 h-4 w-4 accent-primary"
                checked={whatsappEnabled}
                name="whatsappEnabled"
                type="checkbox"
                onChange={(event) => setWhatsappEnabled(event.target.checked)}
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
                checked={notifyCustomer}
                name="notifyCustomerOnBooking"
                type="checkbox"
                onChange={(event) => setNotifyCustomer(event.target.checked)}
              />
              Notify customers for booking confirmations, reschedules, and status changes
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                className="h-4 w-4 accent-primary"
                checked={notifySalon}
                name="notifySalonOnBooking"
                type="checkbox"
                onChange={(event) => setNotifySalon(event.target.checked)}
              />
              Notify salon on new bookings
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="whatsapp-provider">
                Provider
              </label>
              <select
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                id="whatsapp-provider"
                name="provider"
                value={provider}
                onChange={(event) => setProvider(event.target.value as WhatsAppProviderName)}
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
                id="whatsapp-from-number"
                name="fromNumber"
                placeholder="+14155238886"
                value={fromNumber}
                onChange={(event) => setFromNumber(event.target.value)}
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
                id="salon-alert-number"
                name="salonAlertNumber"
                placeholder="+94770000000"
                value={salonAlertNumber}
                onChange={(event) => setSalonAlertNumber(event.target.value)}
              />
            </div>

            {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
            {state.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}

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
