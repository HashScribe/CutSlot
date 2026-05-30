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

export function getUtcDayWindow(date: string) {
  const { year, month, day } = parseDateParam(date);
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));

  return { start, end };
}

export function getWeekday(date: string) {
  return getUtcDayWindow(date).start.getUTCDay();
}

export function timeOnDate(date: string, time: string) {
  const { year, month, day } = parseDateParam(date);
  const [hour = "0", minute = "0"] = time.split(":");

  return new Date(Date.UTC(year, month - 1, day, Number(hour), Number(minute), 0, 0));
}
