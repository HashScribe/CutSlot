import type { AvailabilitySlot, GenerateSlotsInput, TimeWindow } from "./types";

const DEFAULT_SLOT_INTERVAL_MINUTES = 15;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function overlaps(a: TimeWindow, b: TimeWindow) {
  return a.start < b.end && b.start < a.end;
}

function fitsInside(candidate: TimeWindow, window: TimeWindow) {
  return candidate.start >= window.start && candidate.end <= window.end;
}

export function generateAvailabilitySlots(input: GenerateSlotsInput): AvailabilitySlot[] {
  const slotInterval = input.slotIntervalMinutes ?? DEFAULT_SLOT_INTERVAL_MINUTES;
  const totalMinutes = input.durationMinutes + input.bufferMinutes;
  const unavailable = [...input.blockedWindows, ...input.existingBookings];
  const slots: AvailabilitySlot[] = [];

  for (const workingWindow of input.workingWindows) {
    let cursor = new Date(workingWindow.start);

    while (addMinutes(cursor, totalMinutes) <= workingWindow.end) {
      const candidate = {
        start: new Date(cursor),
        end: addMinutes(cursor, totalMinutes)
      };

      const isAvailable =
        fitsInside(candidate, workingWindow) &&
        unavailable.every((window) => !overlaps(candidate, window));

      if (isAvailable) {
        slots.push(candidate);
      }

      cursor = addMinutes(cursor, slotInterval);
    }
  }

  return slots;
}
