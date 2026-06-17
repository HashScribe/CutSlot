import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/lib/session";
import { listBookingsForSalon } from "@/modules/bookings/lib/queries";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listActiveServicesForSalon } from "@/modules/services/lib/queries";
import { listActiveStaffForSalon, listStaffServicesForTenant } from "@/modules/staff/lib/queries";
import { getActiveTenantForUser } from "@/modules/tenants/lib/queries";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      salon: null,
      bookings: [],
      services: [],
      staff: [],
      assignments: []
    });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getActiveTenantForUser(user.id);

  if (!tenant) {
    return NextResponse.json({
      salon: null,
      bookings: [],
      services: [],
      staff: [],
      assignments: []
    });
  }

  const salon = await getPrimarySalonForTenant(tenant.id);

  if (!salon) {
    return NextResponse.json({
      salon: null,
      bookings: [],
      services: [],
      staff: [],
      assignments: []
    });
  }

  const [bookings, services, staff, assignments] = await Promise.all([
    listBookingsForSalon({ tenantId: tenant.id, salonId: salon.id }),
    listActiveServicesForSalon(tenant.id, salon.id),
    listActiveStaffForSalon(tenant.id, salon.id),
    listStaffServicesForTenant(tenant.id)
  ]);

  return NextResponse.json({
    salon,
    bookings,
    services,
    staff,
    assignments
  });
}
