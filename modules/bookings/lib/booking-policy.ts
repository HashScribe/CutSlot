export type BookingPolicy = {
  bookingWindowDays: number | null;
  bookingWindowOpensAt: string;
  minimumNoticeMinutes: number;
  timezone: string;
};

export type BookingDateBounds = {
  currentDate: string;
  minDate: string;
  maxDate: string | null;
  hasBookableDates: boolean;
  opensAt: string;
  timezone: string;
};

export type BookingPolicyValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export const DEFAULT_BOOKING_POLICY: BookingPolicy = {
  bookingWindowDays: 30,
  bookingWindowOpensAt: "00:00",
  minimumNoticeMinutes: 0,
  timezone: "Asia/Colombo"
};

export const BOOKING_POLICY_LIMITS = {
  maxBookingWindowDays: 730,
  maxMinimumNoticeMinutes: 525600
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isDateValue(value: string) {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return toDateValue(date) === value;
}

function compareDateValues(a: string, b: string) {
  return a.localeCompare(b);
}

function addDays(dateValue: string, days: number) {
  const match = DATE_PATTERN.exec(dateValue);
  if (!match) return dateValue;

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() + days);
  return toDateValue(date);
}

function getTimeZoneParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return {
    dateValue: `${values.year}-${values.month}-${values.day}`,
    timeValue: `${values.hour}:${values.minute}`
  };
}

export function isValidTimeZone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function normalizeBookingPolicyTime(value?: string | null) {
  const time = value?.slice(0, 5) ?? DEFAULT_BOOKING_POLICY.bookingWindowOpensAt;
  return TIME_PATTERN.test(time) ? time : DEFAULT_BOOKING_POLICY.bookingWindowOpensAt;
}

export function normalizeBookingPolicy(policy: Partial<BookingPolicy> | null | undefined): BookingPolicy {
  const bookingWindowDays =
    policy?.bookingWindowDays === null
      ? null
      : typeof policy?.bookingWindowDays === "number"
        ? Math.min(
            Math.max(0, Math.trunc(policy.bookingWindowDays)),
            BOOKING_POLICY_LIMITS.maxBookingWindowDays
          )
        : DEFAULT_BOOKING_POLICY.bookingWindowDays;
  const minimumNoticeMinutes =
    typeof policy?.minimumNoticeMinutes === "number"
      ? Math.min(
          Math.max(0, Math.trunc(policy.minimumNoticeMinutes)),
          BOOKING_POLICY_LIMITS.maxMinimumNoticeMinutes
        )
      : DEFAULT_BOOKING_POLICY.minimumNoticeMinutes;
  const timezone =
    policy?.timezone && isValidTimeZone(policy.timezone)
      ? policy.timezone
      : DEFAULT_BOOKING_POLICY.timezone;

  return {
    bookingWindowDays,
    bookingWindowOpensAt: normalizeBookingPolicyTime(policy?.bookingWindowOpensAt),
    minimumNoticeMinutes,
    timezone
  };
}

export function getBookingDateBounds(
  policyInput: Partial<BookingPolicy> | null | undefined,
  now = new Date()
): BookingDateBounds {
  const policy = normalizeBookingPolicy(policyInput);
  const current = getTimeZoneParts(now, policy.timezone);
  const hasOpenedToday = current.timeValue >= policy.bookingWindowOpensAt;
  const minDate = hasOpenedToday ? current.dateValue : addDays(current.dateValue, 1);
  const anchorDate = hasOpenedToday ? current.dateValue : addDays(current.dateValue, -1);
  const maxDate =
    policy.bookingWindowDays === null
      ? null
      : addDays(anchorDate, policy.bookingWindowDays);

  return {
    currentDate: current.dateValue,
    minDate,
    maxDate,
    hasBookableDates: !maxDate || compareDateValues(minDate, maxDate) <= 0,
    opensAt: policy.bookingWindowOpensAt,
    timezone: policy.timezone
  };
}

export function validateBookingDateAgainstPolicy({
  date,
  now,
  policy
}: {
  date: string;
  now?: Date;
  policy: Partial<BookingPolicy> | null | undefined;
}): BookingPolicyValidationResult {
  if (!isDateValue(date)) {
    return { ok: false, error: "Choose a valid booking date." };
  }

  const bounds = getBookingDateBounds(policy, now);

  if (compareDateValues(date, bounds.currentDate) < 0) {
    return { ok: false, error: "Bookings cannot be made for past dates." };
  }

  if (compareDateValues(date, bounds.minDate) < 0) {
    return {
      ok: false,
      error: `Bookings for today open at ${bounds.opensAt}. Please try again later.`
    };
  }

  if (bounds.maxDate && compareDateValues(bounds.maxDate, bounds.minDate) < 0) {
    return {
      ok: false,
      error: `Bookings for today open at ${bounds.opensAt}. Please try again later.`
    };
  }

  if (bounds.maxDate && compareDateValues(date, bounds.maxDate) > 0) {
    return {
      ok: false,
      error: `Bookings are only open through ${bounds.maxDate}.`
    };
  }

  return { ok: true };
}

function formatNotice(minutes: number) {
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} ${days === 1 ? "day" : "days"}`;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${minutes} minutes`;
}

export function validateBookingSlotAgainstPolicy({
  date,
  now = new Date(),
  policy,
  slotStart
}: {
  date: string;
  now?: Date;
  policy: Partial<BookingPolicy> | null | undefined;
  slotStart: Date;
}): BookingPolicyValidationResult {
  const dateResult = validateBookingDateAgainstPolicy({ date, now, policy });
  if (!dateResult.ok) return dateResult;

  const normalizedPolicy = normalizeBookingPolicy(policy);
  const minimumStartTime = new Date(
    now.getTime() + normalizedPolicy.minimumNoticeMinutes * 60_000
  );

  if (slotStart.getTime() <= now.getTime()) {
    return { ok: false, error: "Bookings cannot be made for past times." };
  }

  if (slotStart.getTime() < minimumStartTime.getTime()) {
    return {
      ok: false,
      error: `Bookings require at least ${formatNotice(normalizedPolicy.minimumNoticeMinutes)} notice.`
    };
  }

  return { ok: true };
}

export function isBookingDateAllowed(
  date: string,
  policy: Partial<BookingPolicy> | null | undefined,
  now = new Date()
) {
  return validateBookingDateAgainstPolicy({ date, now, policy }).ok;
}

export function isBookingSlotAllowed({
  date,
  now,
  policy,
  slotStart
}: {
  date: string;
  now?: Date;
  policy: Partial<BookingPolicy> | null | undefined;
  slotStart: Date;
}) {
  return validateBookingSlotAgainstPolicy({ date, now, policy, slotStart }).ok;
}
