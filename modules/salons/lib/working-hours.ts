import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

export type WorkingHour = {
  id: string;
  tenantId: string;
  salonId: string;
  staffId: string | null;
  weekday: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type WorkingHourRow = {
  id: string;
  tenant_id: string;
  salon_id: string;
  staff_id: string | null;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export const listWorkingHoursForSalon = cache(async (tenantId: string, salonId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("working_hours")
    .select("id, tenant_id, salon_id, staff_id, weekday, start_time, end_time, is_active")
    .eq("tenant_id", tenantId)
    .eq("salon_id", salonId)
    .is("staff_id", null)
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as WorkingHourRow[]).map((row) => ({
    id: row.id,
    tenantId: row.tenant_id,
    salonId: row.salon_id,
    staffId: row.staff_id,
    weekday: row.weekday,
    startTime: row.start_time,
    endTime: row.end_time,
    isActive: row.is_active
  }));
});
