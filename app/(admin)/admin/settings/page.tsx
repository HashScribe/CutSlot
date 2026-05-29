import { PageHeader } from "@/components/shared/page-header";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { SalonBrandingPanel } from "@/modules/salons/components/salon-branding-panel";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listWorkingHoursForSalon } from "@/modules/salons/lib/working-hours";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

export default async function SettingsPage() {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;
  const workingHours = context && salon ? await listWorkingHoursForSalon(context.tenant.id, salon.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure salon identity, public branding, working hours, and WhatsApp settings." />
      {salon ? <SalonBrandingPanel salon={salon} workingHours={workingHours} /> : <NoSalonState />}
    </div>
  );
}
