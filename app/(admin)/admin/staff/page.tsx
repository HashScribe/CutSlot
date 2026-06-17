import { PageHeader } from "@/components/shared/page-header";
import { AdminStaffQueryPanel } from "@/modules/staff/components/admin-staff-query-panel";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Staff" description="Manage staff profiles, service assignments, and working availability." />
      <AdminStaffQueryPanel />
    </div>
  );
}
