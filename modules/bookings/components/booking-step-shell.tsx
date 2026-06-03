"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
} from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Scissors,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createPublicBookingAction } from "@/modules/bookings/lib/actions";
import {
  getBookingDateBounds,
  validateBookingDateAgainstPolicy,
  type BookingPolicy,
} from "@/modules/bookings/lib/booking-policy";
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

function formatPrice(priceCents?: number | null) {
  if (priceCents == null) return "Price varies";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

function formatTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(value));
}

function staffForService(
  serviceId: string,
  staff: StaffMember[],
  assignments: StaffService[]
) {
  const assignedIds = new Set(
    assignments
      .filter((item) => item.serviceId === serviceId)
      .map((item) => item.staffId)
  );
  return staff.filter((member) => assignedIds.has(member.id));
}

function optionClass(isSelected: boolean) {
  return cn(
    "tenant-option group rounded-md border p-4 text-left text-white transition duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tenant-accent)]",
    "hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]",
    isSelected
      ? "border-white/30 bg-white/[0.08]"
      : "border-white/10 bg-black/20"
  );
}

function selectedStyle(
  isSelected: boolean,
  accentColor: string
): CSSProperties {
  if (!isSelected) return {};

  return {
    borderColor: accentColor,
    boxShadow: `0 0 0 2px ${accentColor}33`,
  };
}

const fieldClassName =
  "tenant-field border-white/10 bg-black/20 text-white placeholder:text-white/35";

export function BookingStepShell({
  accentColor,
  initialServiceId,
  logoUrl,
  salonId,
  salonName,
  salonSlug,
  services,
  staff,
  assignments,
  bookingPolicy,
}: {
  accentColor: string;
  bookingPolicy: BookingPolicy;
  initialServiceId?: string;
  logoUrl?: string | null;
  salonId: string;
  salonName: string;
  salonSlug: string;
  services: Service[];
  staff: StaffMember[];
  assignments: StaffService[];
}) {
  const initialSelectedServiceId =
    services.find((service) => service.id === initialServiceId)?.id ??
    services[0]?.id ??
    "";
  const dateBounds = useMemo(
    () => getBookingDateBounds(bookingPolicy),
    [bookingPolicy]
  );
  const dateInputMax =
    dateBounds.maxDate && dateBounds.maxDate >= dateBounds.minDate
      ? dateBounds.maxDate
      : dateBounds.minDate;
  const [selectedServiceId, setSelectedServiceId] = useState(
    initialSelectedServiceId
  );
  const [selectedStaffId, setSelectedStaffId] = useState("any");
  const [selectedDate, setSelectedDate] = useState(dateBounds.minDate);
  const [selectedSlot, setSelectedSlot] = useState<{
    staffId: string;
    start: string;
  } | null>(null);
  const [availability, setAvailability] = useState<
    AvailabilityResponse["availability"]
  >([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [state, formAction] = useActionState(createPublicBookingAction, {});
  const timeSectionRef = useRef<HTMLDivElement>(null);
  const customerDetailsRef = useRef<HTMLDivElement>(null);

  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  );
  const eligibleStaff = useMemo(
    () => staffForService(selectedServiceId, staff, assignments),
    [assignments, selectedServiceId, staff]
  );
  const selectedDatePolicy = useMemo(
    () =>
      validateBookingDateAgainstPolicy({
        date: selectedDate,
        policy: bookingPolicy,
      }),
    [bookingPolicy, selectedDate]
  );

  useEffect(() => {
    setSelectedDate((currentDate) => {
      if (currentDate < dateBounds.minDate) return dateBounds.minDate;
      if (dateBounds.maxDate && currentDate > dateBounds.maxDate) {
        return dateBounds.maxDate < dateBounds.minDate
          ? dateBounds.minDate
          : dateBounds.maxDate;
      }
      return currentDate;
    });
  }, [dateBounds.maxDate, dateBounds.minDate]);

  useEffect(() => {
    setSelectedStaffId("any");
    setSelectedSlot(null);
  }, [selectedServiceId]);

  useEffect(() => {
    if (!selectedServiceId || !selectedDate) {
      setAvailability([]);
      return;
    }

    if (!selectedDatePolicy.ok) {
      setAvailability([]);
      setIsLoadingSlots(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      serviceId: selectedServiceId,
      date: selectedDate,
    });

    if (selectedStaffId !== "any") {
      params.set("staffId", selectedStaffId);
    }

    setIsLoadingSlots(true);
    setSelectedSlot(null);

    fetch(`/api/salons/${salonSlug}/availability?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data: AvailabilityResponse) =>
        setAvailability(data.availability ?? [])
      )
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setAvailability([]);
        }
      })
      .finally(() => setIsLoadingSlots(false));

    return () => controller.abort();
  }, [
    salonSlug,
    selectedDate,
    selectedDatePolicy.ok,
    selectedServiceId,
    selectedStaffId,
  ]);

  const slots = availability.flatMap((item) =>
    item.slots.map((slot) => ({
      ...slot,
      staffName: item.staffName,
    }))
  );
  const selectedSlotDetails = selectedSlot
    ? slots.find(
        (slot) =>
          slot.staffId === selectedSlot.staffId &&
          slot.start === selectedSlot.start
      )
    : null;
  const fieldStyle = { caretColor: accentColor } as CSSProperties;
  const handleFieldFocus = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    event.currentTarget.style.borderColor = accentColor;
    event.currentTarget.style.boxShadow = `0 0 0 2px ${accentColor}`;
  };
  const handleFieldBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    event.currentTarget.style.borderColor = "";
    event.currentTarget.style.boxShadow = "";
  };
  const clearSelectedSlot = (shouldScrollToTime = false) => {
    setSelectedSlot(null);

    if (shouldScrollToTime) {
      window.setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    }
  };

  useEffect(() => {
    if (!selectedSlot) return;

    const timeoutId = window.setTimeout(() => {
      customerDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [selectedSlot]);

  return (
    <section
      className="tenant-accent-scope mx-auto w-full max-w-6xl px-4 py-10 md:py-14"
      style={{ "--tenant-accent": accentColor } as CSSProperties}
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] md:items-end">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-[0.22em]"
            style={{ color: accentColor }}
          >
            {salonSlug}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-white md:text-6xl">
              Book {salonName}
            </h1>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-white/60">
            Pick a service, choose a specialist or the earliest available time,
            and confirm your visit in one smooth flow.
          </p>
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
          <div className="flex items-center gap-3 text-white">
            <CalendarDays
              className="h-4 w-4"
              style={{ color: accentColor }}
              aria-hidden="true"
            />
            <span className="font-medium">Live availability</span>
          </div>
          <p className="mt-2 leading-6">
            Slots update from salon hours, staff schedules, blocked times,
            existing bookings, duration, buffer, and booking rules.
          </p>
          <p className="mt-2 text-xs text-white/45">
            {dateBounds.maxDate
              ? `Bookings are open through ${dateBounds.maxDate}.`
              : "Future bookings are unlimited."}
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <Card className="mt-8 border-white/10 bg-white/[0.04] text-white">
          <CardContent className="p-6">
            <p className="font-medium">No services available yet</p>
            <p className="mt-1 text-sm text-white/60">
              This salon has not published bookable services.
            </p>
          </CardContent>
        </Card>
      ) : (
        <form action={formAction} className="mt-8 space-y-5">
          <input name="salonSlug" type="hidden" value={salonSlug} />
          <input name="salonId" type="hidden" value={salonId} />
          <input name="serviceId" type="hidden" value={selectedServiceId} />
          <input
            name="staffId"
            type="hidden"
            value={selectedSlot?.staffId ?? ""}
          />
          <input
            name="startTime"
            type="hidden"
            value={selectedSlot?.start ?? ""}
          />
          <input name="bookingDate" type="hidden" value={selectedDate} />

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scissors
                    className="h-4 w-4"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  1. Choose service
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {services.map((service) => {
                  const isSelected = selectedServiceId === service.id;

                  return (
                    <button
                      key={service.id}
                      className={optionClass(isSelected)}
                      style={selectedStyle(isSelected, accentColor)}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-medium">
                            {isSelected ? (
                              <Check
                                className="h-4 w-4"
                                style={{ color: accentColor }}
                                aria-hidden="true"
                              />
                            ) : null}
                            {service.name}
                          </p>
                          {service.description ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                              {service.description}
                            </p>
                          ) : null}
                        </div>
                        <p className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium">
                          {formatPrice(service.priceCents)}
                        </p>
                      </div>
                      <p className="mt-3 flex items-center gap-2 text-xs text-white/50">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {service.durationMinutes} min / {service.bufferMinutes}{" "}
                        min buffer
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserRound
                    className="h-4 w-4"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  2. Choose staff
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <button
                  className={optionClass(selectedStaffId === "any")}
                  style={selectedStyle(selectedStaffId === "any", accentColor)}
                  type="button"
                  onClick={() => setSelectedStaffId("any")}
                >
                  <p className="flex items-center gap-2 font-medium">
                    {selectedStaffId === "any" ? (
                      <Check
                        className="h-4 w-4"
                        style={{ color: accentColor }}
                        aria-hidden="true"
                      />
                    ) : null}
                    Any available staff
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Show the earliest available slots.
                  </p>
                </button>
                {eligibleStaff.map((member) => {
                  const isSelected = selectedStaffId === member.id;

                  return (
                    <button
                      key={member.id}
                      className={optionClass(isSelected)}
                      style={selectedStyle(isSelected, accentColor)}
                      type="button"
                      onClick={() => setSelectedStaffId(member.id)}
                    >
                      <p className="flex items-center gap-2 font-medium">
                        {isSelected ? (
                          <Check
                            className="h-4 w-4"
                            style={{ color: accentColor }}
                            aria-hidden="true"
                          />
                        ) : null}
                        {member.displayName}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        Assigned to {selectedService?.name}.
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div ref={timeSectionRef} className="scroll-mt-6">
            <Card className="border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays
                    className="h-4 w-4"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  3. Choose date and time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  className={cn("max-w-xs [color-scheme:dark]", fieldClassName)}
                  max={dateInputMax}
                  min={dateBounds.minDate}
                  style={fieldStyle}
                  type="date"
                  value={selectedDate}
                  onBlur={handleFieldBlur}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedSlot(null);
                  }}
                  onFocus={handleFieldFocus}
                />
                {isLoadingSlots ? (
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[66px] animate-pulse rounded-md border border-white/10 bg-white/[0.04]"
                      />
                    ))}
                  </div>
                ) : null}
                {!isLoadingSlots && !selectedDatePolicy.ok ? (
                  <p className="rounded-md border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    {selectedDatePolicy.error}
                  </p>
                ) : null}
                {!isLoadingSlots &&
                selectedDatePolicy.ok &&
                slots.length === 0 ? (
                  <p className="rounded-md border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                    No available slots for this date.
                  </p>
                ) : null}
                {!isLoadingSlots && selectedSlotDetails ? (
                  <button
                    className={cn(
                      optionClass(true),
                      "flex w-full items-center justify-between gap-4"
                    )}
                    style={selectedStyle(true, accentColor)}
                    type="button"
                    onClick={() => clearSelectedSlot()}
                  >
                    <span>
                      <span className="flex items-center gap-2 font-medium">
                        <Check
                          className="h-4 w-4"
                          style={{ color: accentColor }}
                          aria-hidden="true"
                        />
                        {formatTime(selectedSlotDetails.start, bookingPolicy.timezone)}
                      </span>
                      <span className="mt-1 block text-xs text-white/60">
                        {selectedSlotDetails.staffName}
                      </span>
                    </span>
                    <span className="text-xs text-white/50">
                      Click to change
                    </span>
                  </button>
                ) : null}
                {!isLoadingSlots && !selectedSlotDetails && slots.length > 0 ? (
                  <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {slots.map((slot) => {
                      const isSelected =
                        selectedSlot?.staffId === slot.staffId &&
                        selectedSlot.start === slot.start;
                      return (
                        <button
                          key={`${slot.staffId}-${slot.start}`}
                          className={optionClass(isSelected)}
                          style={selectedStyle(isSelected, accentColor)}
                          type="button"
                          onClick={() =>
                            setSelectedSlot((currentSlot) =>
                              currentSlot?.staffId === slot.staffId &&
                              currentSlot.start === slot.start
                                ? null
                                : {
                                    staffId: slot.staffId,
                                    start: slot.start,
                                  }
                            )
                          }
                        >
                          <p className="flex items-center gap-2 font-medium">
                            {isSelected ? (
                              <Check
                                className="h-4 w-4"
                                style={{ color: accentColor }}
                                aria-hidden="true"
                              />
                            ) : null}
                            {formatTime(slot.start, bookingPolicy.timezone)}
                          </p>
                          <p className="mt-1 text-xs text-white/60">
                            {slot.staffName}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div ref={customerDetailsRef} className="scroll-mt-6">
            <Card className="border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserRoundPlus
                    className="h-4 w-4"
                    style={{ color: accentColor }}
                    aria-hidden="true"
                  />
                  4. Your details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {selectedSlotDetails ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/10 bg-black/20 p-4 md:col-span-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                        Selected time
                      </p>
                      <p className="mt-2 flex items-center gap-2 font-medium text-white">
                        <Check
                          className="h-4 w-4"
                          style={{ color: accentColor }}
                          aria-hidden="true"
                        />
                        {formatTime(selectedSlotDetails.start, bookingPolicy.timezone)} with{" "}
                        {selectedSlotDetails.staffName}
                      </p>
                    </div>
                    <button
                      className="rounded-md px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                      type="button"
                      onClick={() => clearSelectedSlot(true)}
                    >
                      Change time
                    </button>
                  </div>
                ) : null}
                <Input
                  className={fieldClassName}
                  name="customerName"
                  placeholder="Your name"
                  required
                  style={fieldStyle}
                  onBlur={handleFieldBlur}
                  onFocus={handleFieldFocus}
                />
                <Input
                  className={fieldClassName}
                  name="customerPhone"
                  placeholder="Phone number"
                  required
                  style={fieldStyle}
                  onBlur={handleFieldBlur}
                  onFocus={handleFieldFocus}
                />
                <Textarea
                  className={cn("md:col-span-2", fieldClassName)}
                  name="notes"
                  placeholder="Notes for the salon"
                  style={fieldStyle}
                  onBlur={handleFieldBlur}
                  onFocus={handleFieldFocus}
                />
                {state.error ? (
                  <p className="text-sm text-destructive md:col-span-2">
                    {state.error}
                  </p>
                ) : null}
                {!selectedSlot ? (
                  <p className="text-sm text-white/60 md:col-span-2">
                    Choose a time slot to confirm.
                  </p>
                ) : null}
                <SubmitButton
                  className="text-[#111827] hover:opacity-95 md:col-span-2"
                  disabled={!selectedSlot}
                  style={{ backgroundColor: accentColor }}
                >
                  Confirm booking
                </SubmitButton>
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </section>
  );
}
