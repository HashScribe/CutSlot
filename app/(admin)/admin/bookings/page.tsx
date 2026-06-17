import { PageHeader } from "@/components/shared/page-header";
import { AdminBookingsQueryPanel } from "@/modules/bookings/components/admin-bookings-query-panel";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Create, reschedule, cancel, and complete appointments from one queue." />
      <AdminBookingsQueryPanel />
    </div>
  );
}
