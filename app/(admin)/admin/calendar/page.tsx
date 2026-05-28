import { PageHeader } from "@/components/shared/page-header";
import { BookingCalendarPlaceholder } from "@/modules/bookings/components/booking-calendar-placeholder";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="A visual schedule for confirmed, pending, and blocked appointments." />
      <BookingCalendarPlaceholder />
    </div>
  );
}
