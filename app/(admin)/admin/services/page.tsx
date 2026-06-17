import { PageHeader } from "@/components/shared/page-header";
import { AdminServicesQueryPanel } from "@/modules/services/components/admin-services-query-panel";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Define bookable services with duration, buffer time, and active status." />
      <AdminServicesQueryPanel />
    </div>
  );
}
