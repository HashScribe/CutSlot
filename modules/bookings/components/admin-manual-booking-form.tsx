"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { CalendarPlus, Check, Clock3 } from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAdminBookingAction } from "@/modules/bookings/lib/actions";
import type { Service } from "@/modules/services/lib/types";
import type { StaffMember, StaffService } from "@/modules/staff/lib/types";

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

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function staffForService(serviceId: string, staff: StaffMember[], assignments: StaffService[]) {
  const assignedIds = new Set(assignments.filter((item) => item.serviceId === serviceId).map((item) => item.staffId));
  return staff.filter((member) => assignedIds.has(member.id));
}

export function AdminManualBookingForm({
  assignments,
  salonId,
  salonSlug,
  services,
  staff
}: {
  assignments: StaffService[];
  salonId: string;
  salonSlug: string;
  services: Service[];
  staff: StaffMember[];
}) {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [selectedStaffId, setSelectedStaffId] = useState("any");
  const [selectedDate, setSelectedDate] = useState(todayDateValue());
  const [selectedSlot, setSelectedSlot] = useState<{ staffId: string; start: string } | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse["availability"]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [state, formAction] = useActionState(createAdminBookingAction, {});
  const eligibleStaff = useMemo(
    () => staffForService(selectedServiceId, staff, assignments),
    [assignments, selectedServiceId, staff]
  );

  useEffect(() => {
    setSelectedStaffId("any");
    setSelectedSlot(null);
  }, [selectedServiceId]);

  useEffect(() => {
    if (!selectedServiceId || !selectedDate) {
      setAvailability([]);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      serviceId: selectedServiceId,
      date: selectedDate
    });

    if (selectedStaffId !== "any") {
      params.set("staffId", selectedStaffId);
    }

    setIsLoadingSlots(true);
    setSelectedSlot(null);

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
  }, [salonSlug, selectedDate, selectedServiceId, selectedStaffId]);

  const slots = availability.flatMap((item) =>
    item.slots.map((slot) => ({
      ...slot,
      staffName: item.staffName
    }))
  );
  const selectedSlotDetails = selectedSlot
    ? slots.find((slot) => slot.staffId === selectedSlot.staffId && slot.start === selectedSlot.start)
    : null;

  return (
    <Card id="new-booking">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4 text-primary" aria-hidden="true" />
          Create booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input name="salonId" type="hidden" value={salonId} />
          <input name="serviceId" type="hidden" value={selectedServiceId} />
          <input name="staffId" type="hidden" value={selectedSlot?.staffId ?? ""} />
          <input name="startTime" type="hidden" value={selectedSlot?.start ?? ""} />
          <input name="bookingDate" type="hidden" value={selectedDate} />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admin-booking-service">Service</label>
              <select
                id="admin-booking-service"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={selectedServiceId}
                onChange={(event) => setSelectedServiceId(event.target.value)}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admin-booking-staff">Staff</label>
              <select
                id="admin-booking-staff"
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={selectedStaffId}
                onChange={(event) => setSelectedStaffId(event.target.value)}
              >
                <option value="any">Any available staff</option>
                {eligibleStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admin-booking-date">Date</label>
              <Input
                id="admin-booking-date"
                min={todayDateValue()}
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Time</p>
            {isLoadingSlots ? <p className="text-sm text-muted-foreground">Loading slots...</p> : null}
            {!isLoadingSlots && selectedSlotDetails ? (
              <button
                className="flex w-full items-center justify-between rounded-md border border-primary bg-primary/10 p-3 text-left"
                type="button"
                onClick={() => setSelectedSlot(null)}
              >
                <span>
                  <span className="flex items-center gap-2 font-medium">
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                    {formatTime(selectedSlotDetails.start)}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{selectedSlotDetails.staffName}</span>
                </span>
                <span className="text-xs text-muted-foreground">Click to change</span>
              </button>
            ) : null}
            {!isLoadingSlots && !selectedSlotDetails && slots.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={`${slot.staffId}-${slot.start}`}
                    className="rounded-md border border-border p-3 text-left transition hover:border-primary hover:bg-secondary"
                    type="button"
                    onClick={() => setSelectedSlot({ staffId: slot.staffId, start: slot.start })}
                  >
                    <span className="block font-medium">{formatTime(slot.start)}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{slot.staffName}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {!isLoadingSlots && slots.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                No available slots for this service and date.
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admin-customer-name">Customer name</label>
              <Input id="admin-customer-name" name="customerName" placeholder="Customer name" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admin-customer-phone">Phone</label>
              <Input id="admin-customer-phone" name="customerPhone" placeholder="Phone number" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="admin-booking-notes">Notes</label>
            <Textarea id="admin-booking-notes" name="notes" placeholder="Internal note or customer request" />
          </div>

          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}
          <SubmitButton className="w-full" disabled={!selectedSlot || services.length === 0}>
            Create booking
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
