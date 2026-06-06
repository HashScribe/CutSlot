import { cache } from "react";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingApprovalMode, Salon } from "./types";

type SalonRow = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  accent_color: string;
  theme_mode: "light" | "dark";
  slot_interval_minutes: number;
  booking_window_days: number | null;
  booking_window_opens_at: string;
  booking_approval_mode: BookingApprovalMode;
  minimum_notice_minutes: number;
  timezone: string;
};

const salonSelect = `
  id,
  tenant_id,
  name,
  slug,
  phone,
  address,
  logo_url,
  accent_color,
  theme_mode,
  slot_interval_minutes,
  booking_window_days,
  booking_window_opens_at,
  booking_approval_mode,
  minimum_notice_minutes,
  timezone
`;

function mapSalon(row: SalonRow): Salon {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    phone: row.phone,
    address: row.address,
    logoUrl: row.logo_url,
    accentColor: row.accent_color,
    themeMode: row.theme_mode,
    slotIntervalMinutes: row.slot_interval_minutes,
    bookingWindowDays: row.booking_window_days,
    bookingWindowOpensAt: row.booking_window_opens_at.slice(0, 5),
    bookingApprovalMode: row.booking_approval_mode,
    minimumNoticeMinutes: row.minimum_notice_minutes,
    timezone: row.timezone
  };
}

export const getPrimarySalonForTenant = cache(async (tenantId: string): Promise<Salon | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("salons")
    .select(salonSelect)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSalon(data as SalonRow);
});

export const getSalonBySlug = cache(async (slug: string): Promise<Salon | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("salons")
    .select(salonSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSalon(data as SalonRow);
});
