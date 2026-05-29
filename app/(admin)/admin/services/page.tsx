import { PageHeader } from "@/components/shared/page-header";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { ServiceSetupPanel } from "@/modules/services/components/service-setup-panel";
import { listServicesForSalon } from "@/modules/services/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

export default async function ServicesPage() {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;
  const services = context && salon ? await listServicesForSalon(context.tenant.id, salon.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Define bookable services with duration, buffer time, and active status." />
      {salon ? <ServiceSetupPanel services={services} /> : <NoSalonState />}
    </div>
  );
}
