import { PageHeader } from "@/components/shared/page-header";
import { ServiceSetupPanel } from "@/modules/services/components/service-setup-panel";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Define bookable services with duration, buffer time, and active status." />
      <ServiceSetupPanel />
    </div>
  );
}
