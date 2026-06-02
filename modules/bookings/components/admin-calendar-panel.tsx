import { CalendarDays, Clock3, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingStatus, BookingWithDetails } from "@/modules/bookings/lib/types";

const statusVariants: Record<BookingStatus, "default" | "success" | "muted" | "danger"> = {
  pending: "default",
  confirmed: "success",
  cancelled: "danger",
  completed: "muted",
  no_show: "danger"
};

function dateKey(value: string) {
  return value.slice(0, 10);
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatTimeRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

function statusLabel(status: BookingStatus) {
  return status.replace("_", " ");
}

export function AdminCalendarPanel({
  bookings,
  days
}: {
  bookings: BookingWithDetails[];
  days: string[];
}) {
  const bookingsByDay = new Map<string, BookingWithDetails[]>();

  for (const day of days) {
    bookingsByDay.set(day, []);
  }

  for (const booking of bookings) {
    const key = dateKey(booking.startTime);
    bookingsByDay.get(key)?.push(booking);
  }

  return (
    <div className="grid gap-4">
      {days.map((day) => {
        const dayBookings = bookingsByDay.get(day) ?? [];

        return (
          <Card key={day}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                  {formatDay(day)}
                </span>
                <Badge variant={dayBookings.length > 0 ? "default" : "muted"}>
                  {dayBookings.length} bookings
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayBookings.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No appointments scheduled.
                </div>
              ) : null}

              {dayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="grid gap-3 rounded-md border border-border bg-secondary/20 p-4 md:grid-cols-[160px_1fr_auto]"
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                    {formatTimeRange(booking.startTime, booking.endTime)}
                  </p>
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                      {booking.staffName} / {booking.serviceName}
                    </p>
                  </div>
                  <Badge className="w-fit capitalize" variant={statusVariants[booking.status]}>
                    {statusLabel(booking.status)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
