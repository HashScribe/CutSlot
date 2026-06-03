import { CalendarDays, Clock3, Phone, Scissors, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminManualBookingForm } from "@/modules/bookings/components/admin-manual-booking-form";
import { BookingRescheduleForm } from "@/modules/bookings/components/booking-reschedule-form";
import { BookingStatusActions } from "@/modules/bookings/components/booking-status-actions";
import type { BookingPolicy } from "@/modules/bookings/lib/booking-policy";
import type { BookingStatus, BookingWithDetails } from "@/modules/bookings/lib/types";
import type { Service } from "@/modules/services/lib/types";
import type { StaffMember, StaffService } from "@/modules/staff/lib/types";

const statusVariants: Record<BookingStatus, "default" | "success" | "muted" | "danger"> = {
  pending: "default",
  confirmed: "success",
  cancelled: "danger",
  completed: "muted",
  no_show: "danger"
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function statusLabel(status: BookingStatus) {
  return status.replace("_", " ");
}

export function AdminBookingsPanel({
  assignments,
  bookings,
  bookingPolicy,
  salonId,
  salonSlug,
  services,
  staff
}: {
  assignments: StaffService[];
  bookings: BookingWithDetails[];
  bookingPolicy: BookingPolicy;
  salonId: string;
  salonSlug: string;
  services: Service[];
  staff: StaffMember[];
}) {
  const hasSetup = services.length > 0 && staff.length > 0 && assignments.length > 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      {hasSetup ? (
        <AdminManualBookingForm
          assignments={assignments}
          bookingPolicy={bookingPolicy}
          salonId={salonId}
          salonSlug={salonSlug}
          services={services}
          staff={staff}
        />
      ) : (
        <Card id="new-booking">
          <CardContent className="p-6">
            <p className="font-medium">Finish setup before manual bookings</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add at least one active service, one active staff member, and assign that service to staff.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="font-medium">No bookings yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Customer bookings and manual admin bookings will appear here.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-start justify-between gap-3">
                <span>{booking.customerName}</span>
                <Badge className="capitalize" variant={statusVariants[booking.status]}>
                  {statusLabel(booking.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                  {formatDateTime(booking.startTime)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" aria-hidden="true" />
                  {booking.serviceDurationMinutes} min service / {booking.serviceBufferMinutes} min buffer
                </p>
                <p className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary" aria-hidden="true" />
                  {booking.serviceName}
                </p>
                <p className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  {booking.staffName}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                  {booking.customerPhone}
                </p>
              </div>

              {booking.notes ? (
                <p className="rounded-md border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                  {booking.notes}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <BookingStatusActions bookingId={booking.id} status={booking.status} />
              </div>
              <BookingRescheduleForm booking={booking} bookingPolicy={bookingPolicy} salonSlug={salonSlug} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
