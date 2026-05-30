import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BlockedTime = {
  id: string;
  tenantId: string;
  salonId: string;
  staffId: string | null;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

type BlockedTimeRow = {
  id: string;
  tenant_id: string;
  salon_id: string;
  staff_id: string | null;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

export const listBlockedTimesForSalon = cache(async (tenantId: string, salonId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blocked_times")
    .select("id, tenant_id, salon_id, staff_id, starts_at, ends_at, reason")
    .eq("tenant_id", tenantId)
    .eq("salon_id", salonId)
    .order("starts_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as BlockedTimeRow[]).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    salonId: row.salon_id,
    staffId: row.staff_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    reason: row.reason
  }));
});
