import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/modules/bookings/lib/types";
import type { CustomerWithStats } from "./types";

type CustomerRow = {
  id: string;
  tenant_id: string;
  salon_id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

type BookingRow = {
  customer_id: string;
  start_time: string;
  status: BookingStatus;
};

export const listCustomersForSalon = cache(async (tenantId: string, salonId: string): Promise<CustomerWithStats[]> => {
  const supabase = await createSupabaseServerClient();
  const [{ data: customersData, error: customersError }, { data: bookingsData }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, tenant_id, salon_id, name, phone, created_at, updated_at")
      .eq("tenant_id", tenantId)
      .eq("salon_id", salonId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("customer_id, start_time, status")
      .eq("tenant_id", tenantId)
      .eq("salon_id", salonId)
      .order("start_time", { ascending: true })
  ]);

  if (customersError || !customersData) {
    return [];
  }

  const bookingsByCustomer = new Map<string, BookingRow[]>();

  for (const booking of (bookingsData ?? []) as BookingRow[]) {
    const bookings = bookingsByCustomer.get(booking.customer_id) ?? [];
    bookings.push(booking);
    bookingsByCustomer.set(booking.customer_id, bookings);
  }

  const now = Date.now();

  return (customersData as CustomerRow[]).map((customer) => {
    const bookings = bookingsByCustomer.get(customer.id) ?? [];
    const activeBookings = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed");
    const pastBookings = bookings.filter((booking) => new Date(booking.start_time).getTime() < now);
    const upcomingBookings = activeBookings.filter((booking) => new Date(booking.start_time).getTime() >= now);

    return {
      id: customer.id,
      tenantId: customer.tenant_id,
      salonId: customer.salon_id,
      name: customer.name,
      phone: customer.phone,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      bookingCount: bookings.length,
      nextBookingAt: upcomingBookings[0]?.start_time ?? null,
      lastBookingAt: pastBookings[pastBookings.length - 1]?.start_time ?? null
    };
  });
});
