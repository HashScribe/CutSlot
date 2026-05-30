import { PageHeader } from "@/components/shared/page-header";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { BlockedTimesPanel } from "@/modules/salons/components/blocked-times-panel";
import { SalonBrandingPanel } from "@/modules/salons/components/salon-branding-panel";
import { listBlockedTimesForSalon } from "@/modules/salons/lib/blocked-times";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listWorkingHoursForSalon } from "@/modules/salons/lib/working-hours";
import { listStaffForSalon } from "@/modules/staff/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

export default async function SettingsPage() {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;
  const [workingHours, blockedTimes, staff] =
    context && salon
      ? await Promise.all([
          listWorkingHoursForSalon(context.tenant.id, salon.id),
          listBlockedTimesForSalon(context.tenant.id, salon.id),
          listStaffForSalon(context.tenant.id, salon.id)
        ])
      : [[], [], []];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure salon identity, public branding, working hours, and WhatsApp settings." />
      {salon ? (
        <>
          <SalonBrandingPanel salon={salon} workingHours={workingHours} />
          <BlockedTimesPanel salonId={salon.id} staff={staff} blockedTimes={blockedTimes} />
        </>
      ) : <NoSalonState />}
    </div>
  );
}
