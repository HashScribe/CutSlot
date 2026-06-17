import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/lib/session";
import { listBookingsForSalon } from "@/modules/bookings/lib/queries";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listActiveServicesForSalon } from "@/modules/services/lib/queries";
import { listActiveStaffForSalon } from "@/modules/staff/lib/queries";
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

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      tenant: null,
      salon: null,
      metrics: {
        todayBookings: 0,
        activeServices: 0,
        activeStaff: 0
      }
    });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getActiveTenantForUser(user.id);

  if (!tenant) {
    return NextResponse.json({
      tenant: null,
      salon: null,
      metrics: {
        todayBookings: 0,
        activeServices: 0,
        activeStaff: 0
      }
    });
  }

  const salon = await getPrimarySalonForTenant(tenant.id);

  if (!salon) {
    return NextResponse.json({
      tenant,
      salon: null,
      metrics: {
        todayBookings: 0,
        activeServices: 0,
        activeStaff: 0
      }
    });
  }

  const todayWindow = getTodayWindow();
  const [todayBookings, services, staff] = await Promise.all([
    listBookingsForSalon({
      tenantId: tenant.id,
      salonId: salon.id,
      from: todayWindow.from,
      to: todayWindow.to
    }),
    listActiveServicesForSalon(tenant.id, salon.id),
    listActiveStaffForSalon(tenant.id, salon.id)
  ]);

  return NextResponse.json({
    tenant,
    salon: {
      id: salon.id,
      name: salon.name,
      slug: salon.slug
    },
    metrics: {
      todayBookings: todayBookings.filter((booking) => booking.status === "confirmed" || booking.status === "pending")
        .length,
      activeServices: services.length,
      activeStaff: staff.length
    }
  });
}
