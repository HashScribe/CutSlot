"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { rescheduleBookingAction } from "@/modules/bookings/lib/actions";
import type { BookingWithDetails } from "@/modules/bookings/lib/types";

type AvailabilityResponse = {
  availability: {
    staffId: string;
    staffName: string;
    slots: {
      staffId: string;
      start: string;
      end: string;
    }[];
  }[];
};

function dateValue(value: string) {
  return value.slice(0, 10);
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function BookingRescheduleForm({
  booking,
  salonSlug
}: {
  booking: BookingWithDetails;
  salonSlug: string;
}) {
  const [selectedDate, setSelectedDate] = useState(dateValue(booking.startTime));
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilityResponse["availability"]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [state, formAction] = useActionState(rescheduleBookingAction, {});

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      serviceId: booking.serviceId,
      staffId: booking.staffId,
      date: selectedDate
    });

    setIsLoadingSlots(true);
    setSelectedSlot("");

    fetch(`/api/salons/${salonSlug}/availability?${params.toString()}`, {
      signal: controller.signal
    })
      .then((response) => response.json())
      .then((data: AvailabilityResponse) => setAvailability(data.availability ?? []))
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setAvailability([]);
        }
      })
      .finally(() => setIsLoadingSlots(false));

    return () => controller.abort();
  }, [booking.serviceId, booking.staffId, isOpen, salonSlug, selectedDate]);

  const slots = availability.flatMap((item) => item.slots);

  if (booking.status === "cancelled" || booking.status === "completed" || booking.status === "no_show") {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-secondary/20 p-3">
      <button
        className="flex items-center gap-2 text-sm font-medium text-primary"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        {isOpen ? "Close reschedule" : "Reschedule"}
      </button>

      {isOpen ? (
        <form action={formAction} className="mt-3 space-y-3">
          <input name="bookingId" type="hidden" value={booking.id} />
          <input name="serviceId" type="hidden" value={booking.serviceId} />
          <input name="staffId" type="hidden" value={booking.staffId} />
          <input name="bookingDate" type="hidden" value={selectedDate} />
          <input name="startTime" type="hidden" value={selectedSlot} />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={`reschedule-${booking.id}-date`}>
              New date
            </label>
            <Input
              id={`reschedule-${booking.id}-date`}
              min={todayDateValue()}
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </div>

          {isLoadingSlots ? <p className="text-sm text-muted-foreground">Loading slots...</p> : null}
          {!isLoadingSlots && slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No available slots for this staff member.</p>
          ) : null}
          {!isLoadingSlots && slots.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.start;
                return (
                  <button
                    key={slot.start}
                    className={
                      isSelected
                        ? "rounded-md border border-primary bg-primary/10 p-3 text-left"
                        : "rounded-md border border-border p-3 text-left transition hover:border-primary hover:bg-secondary"
                    }
                    type="button"
                    onClick={() => setSelectedSlot(isSelected ? "" : slot.start)}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {isSelected ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
                      {formatTime(slot.start)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}
          <SubmitButton disabled={!selectedSlot} size="sm" variant="secondary">
            Save new time
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
