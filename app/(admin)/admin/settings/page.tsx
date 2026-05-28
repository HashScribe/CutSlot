import { PageHeader } from "@/components/shared/page-header";
import { SalonBrandingPanel } from "@/modules/salons/components/salon-branding-panel";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure salon identity, public branding, working hours, and WhatsApp settings." />
      <SalonBrandingPanel />
    </div>
  );
}
