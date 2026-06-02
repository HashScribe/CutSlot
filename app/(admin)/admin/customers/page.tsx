import { PageHeader } from "@/components/shared/page-header";
import { CustomerListPanel } from "@/modules/customers/components/customer-list-panel";
import { listCustomersForSalon } from "@/modules/customers/lib/queries";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

export default async function CustomersPage() {
  const context = await getAdminTenantContext();
  const salon = context ? await getPrimarySalonForTenant(context.tenant.id) : null;
  const customers = context && salon ? await listCustomersForSalon(context.tenant.id, salon.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Customer profiles are captured automatically when bookings are created." />
      {salon ? <CustomerListPanel customers={customers} /> : <NoSalonState />}
    </div>
  );
}
