import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseConfig } from "@/lib/env";
import { requireCurrentUser } from "@/modules/auth/lib/session";
import { listBookingsForSalon } from "@/modules/bookings/lib/queries";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listActiveServicesForSalon } from "@/modules/services/lib/queries";
import { listActiveStaffForSalon } from "@/modules/staff/lib/queries";
import { TenantOverview } from "@/modules/tenants/components/tenant-overview";
import { getActiveTenantForUser } from "@/modules/tenants/lib/queries";

function getTodayWindow() {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return {
    from: start.toISOString(),
    to: end.toISOString()
  };
}

export default async function AdminDashboardPage() {
  const tenant =
    hasSupabaseConfig()
      ? await getActiveTenantForUser((await requireCurrentUser()).id)
      : null;
  const salon = tenant ? await getPrimarySalonForTenant(tenant.id) : null;
  const todayWindow = getTodayWindow();
  const [todayBookings, services, staff] = tenant && salon
    ? await Promise.all([
        listBookingsForSalon({
          tenantId: tenant.id,
          salonId: salon.id,
          from: todayWindow.from,
          to: todayWindow.to
        }),
        listActiveServicesForSalon(tenant.id, salon.id),
        listActiveStaffForSalon(tenant.id, salon.id)
      ])
    : [[], [], []];
  const confirmedToday = todayBookings.filter((booking) => booking.status === "confirmed" || booking.status === "pending").length;

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
          ["Today’s bookings", String(confirmedToday), "Pending and confirmed bookings scheduled for today."],
          ["Active services", String(services.length), "Public services available for customer booking."],
          ["Active staff", String(staff.length), "Staff profiles currently active for booking."]
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
