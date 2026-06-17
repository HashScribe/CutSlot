import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/lib/session";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { listServicesForSalon } from "@/modules/services/lib/queries";
import { getActiveTenantForUser } from "@/modules/tenants/lib/queries";

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ salon: null, services: [] });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getActiveTenantForUser(user.id);

  if (!tenant) {
    return NextResponse.json({ salon: null, services: [] });
  }

  const salon = await getPrimarySalonForTenant(tenant.id);

  if (!salon) {
    return NextResponse.json({ salon: null, services: [] });
  }

  const services = await listServicesForSalon(tenant.id, salon.id);

  return NextResponse.json({
    salon: {
      id: salon.id,
      name: salon.name,
      slug: salon.slug
    },
    services
  });
}
