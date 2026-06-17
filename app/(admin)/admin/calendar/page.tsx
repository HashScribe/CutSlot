import { PageHeader } from "@/components/shared/page-header";
import { AdminCalendarQueryPanel } from "@/modules/bookings/components/admin-calendar-query-panel";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="A visual schedule for confirmed, pending, and blocked appointments." />
      <AdminCalendarQueryPanel />
    </div>
  );
}
