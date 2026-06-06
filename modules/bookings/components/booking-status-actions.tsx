import { SubmitButton } from "@/components/shared/submit-button";
import type { BookingStatus } from "@/modules/bookings/lib/types";
import { updateBookingStatusAction } from "@/modules/bookings/lib/actions";

const statusActions: Partial<Record<BookingStatus, { label: string; status: BookingStatus; variant?: "secondary" | "destructive" }[]>> = {
  pending: [
    { label: "Approve", status: "confirmed", variant: "secondary" },
    { label: "Decline", status: "cancelled", variant: "destructive" }
  ],
  confirmed: [
    { label: "Complete", status: "completed", variant: "secondary" },
    { label: "No show", status: "no_show", variant: "secondary" },
    { label: "Cancel", status: "cancelled", variant: "destructive" }
  ],
  cancelled: [{ label: "Reopen", status: "confirmed", variant: "secondary" }],
  no_show: [{ label: "Reopen", status: "confirmed", variant: "secondary" }]
};

export function BookingStatusActions({
  bookingId,
  status
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const actions = statusActions[status] ?? [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <form key={`${bookingId}-${action.status}`} action={updateBookingStatusAction}>
          <input name="bookingId" type="hidden" value={bookingId} />
          <input name="status" type="hidden" value={action.status} />
          <SubmitButton pendingLabel="Saving..." size="sm" variant={action.variant ?? "secondary"}>
            {action.label}
          </SubmitButton>
        </form>
      ))}
    </div>
  );
}
