import { PageHeader } from "@/components/shared/page-header";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listServicesForSalon } from "@/modules/services/lib/queries";
import { StaffSetupPanel } from "@/modules/staff/components/staff-setup-panel";
import { listStaffWorkingHoursForSalon } from "@/modules/salons/lib/working-hours";
import { listStaffForSalon, listStaffServicesForTenant } from "@/modules/staff/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

export default async function StaffPage() {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;
  const [staff, services, assignments, staffWorkingHours] =
    context && salon
      ? await Promise.all([
          listStaffForSalon(context.tenant.id, salon.id),
          listServicesForSalon(context.tenant.id, salon.id),
          listStaffServicesForTenant(context.tenant.id),
          listStaffWorkingHoursForSalon(context.tenant.id, salon.id)
        ])
      : [[], [], [], []];

  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Manage staff profiles, service assignments, and working availability." />
      {salon ? (
        <StaffSetupPanel
          salonId={salon.id}
          staff={staff}
          services={services}
          assignments={assignments}
          staffWorkingHours={staffWorkingHours}
        />
      ) : <NoSalonState />}
    </div>
  );
}
