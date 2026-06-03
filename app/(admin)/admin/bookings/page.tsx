import { PageHeader } from "@/components/shared/page-header";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { AdminBookingsPanel } from "@/modules/bookings/components/admin-bookings-panel";
import { listBookingsForSalon } from "@/modules/bookings/lib/queries";
import { listActiveServicesForSalon } from "@/modules/services/lib/queries";
import { listActiveStaffForSalon, listStaffServicesForTenant } from "@/modules/staff/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

export default async function BookingsPage() {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;
  const [bookings, services, staff, assignments] = context && salon
    ? await Promise.all([
        listBookingsForSalon({ tenantId: context.tenant.id, salonId: salon.id }),
        listActiveServicesForSalon(context.tenant.id, salon.id),
        listActiveStaffForSalon(context.tenant.id, salon.id),
        listStaffServicesForTenant(context.tenant.id)
      ])
    : [[], [], [], []];

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="Create, reschedule, cancel, and complete appointments from one queue." />
      {salon ? (
        <AdminBookingsPanel
          assignments={assignments}
          bookings={bookings}
          bookingPolicy={salon}
          salonId={salon.id}
          salonSlug={salon.slug}
          services={services}
          staff={staff}
        />
      ) : (
        <NoSalonState />
      )}
    </div>
  );
}
