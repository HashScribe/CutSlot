export function parseDateParam(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function getTimeZoneOffsetMs(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return zonedAsUtc - date.getTime();
}

function localTimeToUtc({
  day,
  hour,
  minute,
  month,
  timezone,
  year
}: {
  day: number;
  hour: number;
  minute: number;
  month: number;
  timezone: string;
  year: number;
}) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const offset = getTimeZoneOffsetMs(utcGuess, timezone);
  const candidate = new Date(utcGuess.getTime() - offset);
  const candidateOffset = getTimeZoneOffsetMs(candidate, timezone);

  if (candidateOffset !== offset) {
    return new Date(utcGuess.getTime() - candidateOffset);
  }

  return candidate;
}

function addDays({ day, month, year }: { day: number; month: number; year: number }, days: number) {
  const date = new Date(Date.UTC(year, month - 1, day + days, 0, 0, 0, 0));

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

export function getUtcDayWindow(date: string, timezone = "UTC") {
  const { year, month, day } = parseDateParam(date);
  const nextDay = addDays({ year, month, day }, 1);
  const start = localTimeToUtc({ year, month, day, hour: 0, minute: 0, timezone });
  const end = localTimeToUtc({ ...nextDay, hour: 0, minute: 0, timezone });

  return { start, end };
}

export function getWeekday(date: string) {
  const { year, month, day } = parseDateParam(date);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).getUTCDay();
}

export function timeOnDate(date: string, time: string, timezone = "UTC") {
  const { year, month, day } = parseDateParam(date);
  const [hour = "0", minute = "0"] = time.split(":");

  return localTimeToUtc({
    year,
    month,
    day,
    hour: Number(hour),
    minute: Number(minute),
    timezone
  });
}
