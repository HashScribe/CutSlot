import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/lib/session";
import { listBookingsForSalon } from "@/modules/bookings/lib/queries";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { getActiveTenantForUser } from "@/modules/tenants/lib/queries";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCalendarDays() {
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  return Array.from({ length: 7 }, (_, index) => dayKey(addDays(start, index)));
}

export async function GET() {
  const days = getCalendarDays();

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ salon: null, days, bookings: [] });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getActiveTenantForUser(user.id);

  if (!tenant) {
    return NextResponse.json({ salon: null, days, bookings: [] });
  }

  const salon = await getPrimarySalonForTenant(tenant.id);

  if (!salon) {
    return NextResponse.json({ salon: null, days, bookings: [] });
  }

  const from = `${days[0]}T00:00:00.000Z`;
  const to = `${dayKey(addDays(new Date(from), days.length))}T00:00:00.000Z`;
  const bookings = await listBookingsForSalon({
    tenantId: tenant.id,
    salonId: salon.id,
    from,
    to,
    limit: 200
  });

  return NextResponse.json({
    salon: {
      id: salon.id,
      name: salon.name,
      slug: salon.slug
    },
    days,
    bookings
  });
}
