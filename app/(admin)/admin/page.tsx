import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantOverview } from "@/modules/tenants/components/tenant-overview";
import { requireCurrentUser } from "@/modules/auth/lib/session";
import { hasSupabaseConfig } from "@/lib/env";
import { getActiveTenantForUser } from "@/modules/tenants/lib/queries";

export default async function AdminDashboardPage() {
  const tenant =
    hasSupabaseConfig()
      ? await getActiveTenantForUser((await requireCurrentUser()).id)
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          tenant
            ? `Your salon command center for ${tenant.name}.`
            : "Your salon command center for today’s appointments, setup progress, and booking health."
        }
      />
      <TenantOverview tenantName={tenant?.name} tenantRole={tenant?.role} />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Today’s bookings", "0", "Connect Supabase and create your first booking."],
          ["Active services", "0", "Add services with duration and buffer time."],
          ["Staff online", "0", "Create staff profiles and working hours."]
        ].map(([title, value, description]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {title}
                <Badge variant="muted">Phase 1</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
