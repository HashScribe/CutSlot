import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/lib/session";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listStaffWorkingHoursForSalon } from "@/modules/salons/lib/working-hours";
import { listServicesForSalon } from "@/modules/services/lib/queries";
import { listStaffForSalon, listStaffServicesForTenant } from "@/modules/staff/lib/queries";
import { getActiveTenantForUser } from "@/modules/tenants/lib/queries";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({
      salon: null,
      staff: [],
      services: [],
      assignments: [],
      staffWorkingHours: []
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
      staff: [],
      services: [],
      assignments: [],
      staffWorkingHours: []
    });
  }

  const salon = await getPrimarySalonForTenant(tenant.id);

  if (!salon) {
    return NextResponse.json({
      salon: null,
      staff: [],
      services: [],
      assignments: [],
      staffWorkingHours: []
    });
  }

  const [staff, services, assignments, staffWorkingHours] = await Promise.all([
    listStaffForSalon(tenant.id, salon.id),
    listServicesForSalon(tenant.id, salon.id),
    listStaffServicesForTenant(tenant.id),
    listStaffWorkingHoursForSalon(tenant.id, salon.id)
  ]);

  return NextResponse.json({
    salon: {
      id: salon.id,
      name: salon.name,
      slug: salon.slug
    },
    staff,
    services,
    assignments,
    staffWorkingHours
  });
}
