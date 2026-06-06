"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  saveBookingPolicyAction
} from "@/modules/bookings/lib/booking-policy-actions";
import {
  BOOKING_POLICY_LIMITS,
  normalizeBookingPolicyTime
} from "@/modules/bookings/lib/booking-policy";
import type { Salon } from "@/modules/salons/lib/types";
import { cn } from "@/lib/utils";

export function BookingPolicySettingsPanel({ salon }: { salon: Salon }) {
  const router = useRouter();
  const [bookingApprovalMode, setBookingApprovalMode] = useState(salon.bookingApprovalMode);
  const [isUnlimited, setIsUnlimited] = useState(salon.bookingWindowDays === null);
  const [bookingWindowDays, setBookingWindowDays] = useState(String(salon.bookingWindowDays ?? 30));
  const [bookingWindowOpensAt, setBookingWindowOpensAt] = useState(normalizeBookingPolicyTime(salon.bookingWindowOpensAt));
  const [minimumNoticeMinutes, setMinimumNoticeMinutes] = useState(String(salon.minimumNoticeMinutes));
  const [timezone, setTimezone] = useState(salon.timezone);
  const [state, formAction] = useActionState(saveBookingPolicyAction, {});

  useEffect(() => {
    setBookingApprovalMode(salon.bookingApprovalMode);
    setIsUnlimited(salon.bookingWindowDays === null);
    setBookingWindowDays(String(salon.bookingWindowDays ?? 30));
    setBookingWindowOpensAt(normalizeBookingPolicyTime(salon.bookingWindowOpensAt));
    setMinimumNoticeMinutes(String(salon.minimumNoticeMinutes));
    setTimezone(salon.timezone);
  }, [
    salon.bookingApprovalMode,
    salon.bookingWindowDays,
    salon.bookingWindowOpensAt,
    salon.minimumNoticeMinutes,
    salon.timezone
  ]);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
          Booking rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 lg:grid-cols-2">
          <input name="salonId" type="hidden" value={salon.id} />

          <div className="space-y-3 lg:col-span-2">
            <p className="text-sm font-medium">Booking approval</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                <input
                  className="mt-0.5 h-4 w-4 accent-primary"
                  checked={bookingApprovalMode === "auto"}
                  name="bookingApprovalMode"
                  type="radio"
                  value="auto"
                  onChange={() => setBookingApprovalMode("auto")}
                />
                <span>
                  <span className="block font-medium">Auto approve</span>
                  <span className="mt-1 block text-muted-foreground">
                    Customer bookings are confirmed immediately.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm">
                <input
                  className="mt-0.5 h-4 w-4 accent-primary"
                  checked={bookingApprovalMode === "manual"}
                  name="bookingApprovalMode"
                  type="radio"
                  value="manual"
                  onChange={() => setBookingApprovalMode("manual")}
                />
                <span>
                  <span className="block font-medium">Require approval</span>
                  <span className="mt-1 block text-muted-foreground">
                    New customer bookings stay pending until an admin approves them.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm lg:col-span-2">
            <input
              className="mt-0.5 h-4 w-4 accent-primary"
              checked={isUnlimited}
              name="unlimitedFutureBookings"
              type="checkbox"
              onChange={(event) => setIsUnlimited(event.target.checked)}
            />
            <span>
              <span className="block font-medium">Unlimited future bookings</span>
              <span className="mt-1 block text-muted-foreground">
                When enabled, customers can book any future open day.
              </span>
            </span>
          </label>

          <div className={cn("space-y-2", isUnlimited && "opacity-50")}>
            <label className="text-sm font-medium" htmlFor="booking-window-days">
              Allow bookings up to
            </label>
            <div className="flex items-center gap-2">
              <Input
                disabled={isUnlimited}
                id="booking-window-days"
                max={BOOKING_POLICY_LIMITS.maxBookingWindowDays}
                min={0}
                name="bookingWindowDays"
                type="number"
                value={bookingWindowDays}
                onChange={(event) => setBookingWindowDays(event.target.value)}
              />
              <span className="text-sm text-muted-foreground">days ahead</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Use 0 for same-day only bookings.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="booking-window-opens-at">
              New dates open at
            </label>
            <Input
              id="booking-window-opens-at"
              name="bookingWindowOpensAt"
              type="time"
              value={bookingWindowOpensAt}
              onChange={(event) => setBookingWindowOpensAt(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Today and each new booking day become available at this time.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="minimum-notice-minutes">
              Minimum notice
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="minimum-notice-minutes"
                max={BOOKING_POLICY_LIMITS.maxMinimumNoticeMinutes}
                min={0}
                name="minimumNoticeMinutes"
                step={15}
                type="number"
                value={minimumNoticeMinutes}
                onChange={(event) => setMinimumNoticeMinutes(event.target.value)}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Example: 1440 means customers must book at least one day before.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="booking-timezone">
              Booking timezone
            </label>
            <Input
              id="booking-timezone"
              name="timezone"
              placeholder="Asia/Colombo"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            />
          </div>

          {state.error ? <p className="text-sm text-destructive lg:col-span-2">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-400 lg:col-span-2">{state.success}</p> : null}

          <SubmitButton className="lg:col-span-2">Save booking rules</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
