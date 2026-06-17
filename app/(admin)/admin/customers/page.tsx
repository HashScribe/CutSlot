import { PageHeader } from "@/components/shared/page-header";
import { AdminCustomersQueryPanel } from "@/modules/customers/components/admin-customers-query-panel";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="Customer profiles are captured automatically when bookings are created." />
      <AdminCustomersQueryPanel />
    </div>
  );
}
