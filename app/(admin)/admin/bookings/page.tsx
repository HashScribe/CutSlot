import { PageHeader } from "@/components/shared/page-header";
import { BookingListPlaceholder } from "@/modules/bookings/components/booking-list-placeholder";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Create, reschedule, cancel, and complete appointments from one queue." />
      <BookingListPlaceholder />
    </div>
  );
}
