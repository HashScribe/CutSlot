import assert from "node:assert/strict";
import test from "node:test";
import { generateAvailabilitySlots } from "./slot-generator";

test("uses dynamic slot intervals and service buffer", () => {
  const slots = generateAvailabilitySlots({
    workingWindows: [
      {
        start: new Date("2026-06-01T09:00:00.000Z"),
        end: new Date("2026-06-01T11:00:00.000Z")
      }
    ],
    blockedWindows: [],
    existingBookings: [],
    durationMinutes: 45,
    bufferMinutes: 15,
    slotIntervalMinutes: 30
  });

  assert.deepEqual(
    slots.map((slot) => slot.start.toISOString()),
    [
      "2026-06-01T09:00:00.000Z",
      "2026-06-01T09:30:00.000Z",
      "2026-06-01T10:00:00.000Z"
    ]
  );
});

test("excludes slots that overlap existing bookings", () => {
  const slots = generateAvailabilitySlots({
    workingWindows: [
      {
        start: new Date("2026-06-01T09:00:00.000Z"),
        end: new Date("2026-06-01T11:00:00.000Z")
      }
    ],
    blockedWindows: [],
    existingBookings: [
      {
        start: new Date("2026-06-01T09:30:00.000Z"),
        end: new Date("2026-06-01T10:15:00.000Z")
      }
    ],
    durationMinutes: 30,
    bufferMinutes: 0,
    slotIntervalMinutes: 15
  });

  assert.deepEqual(
    slots.map((slot) => slot.start.toISOString()),
    ["2026-06-01T09:00:00.000Z", "2026-06-01T10:15:00.000Z", "2026-06-01T10:30:00.000Z"]
  );
});
