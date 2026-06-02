import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingStatus, BookingWithDetails } from "./types";

type BookingRow = {
  id: string;
  tenant_id: string;
  salon_id: string;
  customer_id: string;
  staff_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  customers: { name: string; phone: string } | { name: string; phone: string }[] | null;
  services:
    | {
        name: string;
        duration_minutes: number;
        buffer_minutes: number;
      }
    | {
        name: string;
        duration_minutes: number;
        buffer_minutes: number;
      }[]
    | null;
  staff: { display_name: string } | { display_name: string }[] | null;
};

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapBooking(row: BookingRow): BookingWithDetails {
  const customer = firstRelation(row.customers);
  const service = firstRelation(row.services);
  const staff = firstRelation(row.staff);

  return {
    id: row.id,
    tenantId: row.tenant_id,
    salonId: row.salon_id,
    customerId: row.customer_id,
    staffId: row.staff_id,
    serviceId: row.service_id,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    customerName: customer?.name ?? "Unknown customer",
    customerPhone: customer?.phone ?? "",
    serviceName: service?.name ?? "Unknown service",
    serviceDurationMinutes: service?.duration_minutes ?? 0,
    serviceBufferMinutes: service?.buffer_minutes ?? 0,
    staffName: staff?.display_name ?? "Unknown staff"
  };
}

const bookingSelect = `
  id,
  tenant_id,
  salon_id,
  customer_id,
  staff_id,
  service_id,
  start_time,
  end_time,
  status,
  notes,
  created_at,
  customers(name, phone),
  services(name, duration_minutes, buffer_minutes),
  staff(display_name)
`;

export const listBookingsForSalon = cache(
  async ({
    tenantId,
    salonId,
    from,
    to,
    limit = 100
  }: {
    tenantId: string;
    salonId: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<BookingWithDetails[]> => {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("bookings")
      .select(bookingSelect)
      .eq("tenant_id", tenantId)
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true })
      .limit(limit);

    if (from) {
      query = query.gte("start_time", from);
    }

    if (to) {
      query = query.lt("start_time", to);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return (data as unknown as BookingRow[]).map(mapBooking);
  }
);

export const getBookingCountsForSalon = cache(async (tenantId: string, salonId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("status")
    .eq("tenant_id", tenantId)
    .eq("salon_id", salonId);

  const counts = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    no_show: 0
  } satisfies Record<BookingStatus, number>;

  if (error || !data) {
    return counts;
  }

  for (const row of data as { status: BookingStatus }[]) {
    counts[row.status] += 1;
  }

  return counts;
});
