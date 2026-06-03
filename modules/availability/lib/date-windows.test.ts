import assert from "node:assert/strict";
import test from "node:test";
import { getUtcDayWindow, getWeekday, timeOnDate } from "./date-windows";

test("converts salon local working times to UTC instants", () => {
  assert.equal(
    timeOnDate("2026-06-01", "09:00", "Asia/Colombo").toISOString(),
    "2026-06-01T03:30:00.000Z"
  );
  assert.equal(
    timeOnDate("2026-06-01", "17:00", "Asia/Colombo").toISOString(),
    "2026-06-01T11:30:00.000Z"
  );
});

test("creates a UTC query window for the salon local date", () => {
  const window = getUtcDayWindow("2026-06-01", "Asia/Colombo");

  assert.equal(window.start.toISOString(), "2026-05-31T18:30:00.000Z");
  assert.equal(window.end.toISOString(), "2026-06-01T18:30:00.000Z");
});

test("uses the selected local date for weekday lookup", () => {
  assert.equal(getWeekday("2026-06-01"), 1);
});
