import { PageHeader } from "@/components/shared/page-header";
import { AdminCalendarPanel } from "@/modules/bookings/components/admin-calendar-panel";
import { listBookingsForSalon } from "@/modules/bookings/lib/queries";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCalendarDays() {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  return Array.from({ length: 7 }, (_, index) => dayKey(addDays(start, index)));
}

export default async function CalendarPage() {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;
  const days = getCalendarDays();
  const from = `${days[0]}T00:00:00.000Z`;
  const to = `${dayKey(addDays(new Date(from), days.length))}T00:00:00.000Z`;
  const bookings = context && salon
    ? await listBookingsForSalon({
        tenantId: context.tenant.id,
        salonId: salon.id,
        from,
        to,
        limit: 200
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="A visual schedule for confirmed, pending, and blocked appointments." />
      {salon ? <AdminCalendarPanel bookings={bookings} days={days} /> : <NoSalonState />}
    </div>
  );
}
