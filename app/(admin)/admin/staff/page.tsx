import { PageHeader } from "@/components/shared/page-header";
import { StaffSetupPanel } from "@/modules/staff/components/staff-setup-panel";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Manage staff profiles, service assignments, and working availability." />
      <StaffSetupPanel />
    </div>
  );
}
