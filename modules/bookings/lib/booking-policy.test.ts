import assert from "node:assert/strict";
import test from "node:test";
import {
  getBookingDateBounds,
  validateBookingDateAgainstPolicy,
  validateBookingSlotAgainstPolicy,
  type BookingPolicy
} from "./booking-policy";

const policy: BookingPolicy = {
  bookingWindowDays: 3,
  bookingWindowOpensAt: "08:00",
  minimumNoticeMinutes: 0,
  timezone: "UTC"
};

test("opens the next booking day at the configured release time", () => {
  assert.deepEqual(
    getBookingDateBounds(policy, new Date("2026-05-31T07:59:00.000Z")),
    {
      currentDate: "2026-05-31",
      minDate: "2026-06-01",
      maxDate: "2026-06-02",
      hasBookableDates: true,
      opensAt: "08:00",
      timezone: "UTC"
    }
  );

  assert.equal(
    getBookingDateBounds(policy, new Date("2026-05-31T08:00:00.000Z")).maxDate,
    "2026-06-03"
  );
});

test("rejects past dates and dates outside the advance booking window", () => {
  const now = new Date("2026-05-31T09:00:00.000Z");

  assert.equal(
    validateBookingDateAgainstPolicy({ date: "2026-05-30", now, policy }).ok,
    false
  );
  assert.equal(
    validateBookingDateAgainstPolicy({ date: "2026-06-04", now, policy }).ok,
    false
  );
  assert.equal(
    validateBookingDateAgainstPolicy({ date: "2026-06-03", now, policy }).ok,
    true
  );
});

test("supports same-day only bookings after the release time", () => {
  const sameDayPolicy = {
    ...policy,
    bookingWindowDays: 0
  };

  assert.equal(
    getBookingDateBounds(sameDayPolicy, new Date("2026-05-31T07:59:00.000Z"))
      .hasBookableDates,
    false
  );
  assert.equal(
    validateBookingDateAgainstPolicy({
      date: "2026-05-31",
      now: new Date("2026-05-31T08:00:00.000Z"),
      policy: sameDayPolicy
    }).ok,
    true
  );
});

test("rejects past slots and slots inside the minimum notice window", () => {
  const noticePolicy = {
    ...policy,
    minimumNoticeMinutes: 60
  };
  const now = new Date("2026-05-31T10:00:00.000Z");

  assert.equal(
    validateBookingSlotAgainstPolicy({
      date: "2026-05-31",
      now,
      policy: noticePolicy,
      slotStart: new Date("2026-05-31T09:45:00.000Z")
    }).ok,
    false
  );
  assert.equal(
    validateBookingSlotAgainstPolicy({
      date: "2026-05-31",
      now,
      policy: noticePolicy,
      slotStart: new Date("2026-05-31T10:30:00.000Z")
    }).ok,
    false
  );
  assert.equal(
    validateBookingSlotAgainstPolicy({
      date: "2026-05-31",
      now,
      policy: noticePolicy,
      slotStart: new Date("2026-05-31T11:00:00.000Z")
    }).ok,
    true
  );
});

test("allows unlimited future bookings", () => {
  const unlimitedPolicy = {
    ...policy,
    bookingWindowDays: null
  };

  assert.equal(
    validateBookingDateAgainstPolicy({
      date: "2027-05-31",
      now: new Date("2026-05-31T09:00:00.000Z"),
      policy: unlimitedPolicy
    }).ok,
    true
  );
});
