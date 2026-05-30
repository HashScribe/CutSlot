import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSalonBySlug } from "@/modules/salons/lib/queries";
import { generateAvailabilitySlots } from "./slot-generator";
import { getUtcDayWindow, getWeekday, timeOnDate } from "./date-windows";
import type { StaffAvailability, TimeWindow } from "./types";

type ServiceRow = {
  id: string;
  tenant_id: string;
  salon_id: string;
  duration_minutes: number;
  buffer_minutes: number;
  is_active: boolean;
};

type StaffRow = {
  id: string;
  display_name: string;
};

type WorkingHourRow = {
  staff_id: string | null;
  start_time: string;
  end_time: string;
};

type WindowRow = {
  staff_id: string | null;
  starts_at: string;
  ends_at: string;
};

type BookingRow = {
  staff_id: string;
  start_time: string;
  end_time: string;
};

function rowToWindow(row: WindowRow): TimeWindow {
  return {
    start: new Date(row.starts_at),
    end: new Date(row.ends_at)
  };
}

export const getAvailabilityForSalon = cache(
  async ({
    salonSlug,
    serviceId,
    date,
    staffId
  }: {
    salonSlug: string;
    serviceId: string;
    date: string;
    staffId?: string;
  }): Promise<StaffAvailability[]> => {
    const salon = await getSalonBySlug(salonSlug);
    if (!salon) return [];

    const supabase = await createSupabaseServerClient();
    const { data: serviceData } = await supabase
      .from("services")
      .select("id, tenant_id, salon_id, duration_minutes, buffer_minutes, is_active")
      .eq("tenant_id", salon.tenantId)
      .eq("salon_id", salon.id)
      .eq("id", serviceId)
      .eq("is_active", true)
      .maybeSingle();

    if (!serviceData) return [];

    const service = serviceData as ServiceRow;

    let staffQuery = supabase
      .from("staff_services")
      .select("staff:staff_id(id, display_name)")
      .eq("tenant_id", salon.tenantId)
      .eq("service_id", service.id);

    if (staffId) {
      staffQuery = staffQuery.eq("staff_id", staffId);
    }

    const { data: staffServiceData } = await staffQuery;
    const staff = ((staffServiceData ?? []) as { staff: StaffRow | StaffRow[] | null }[])
      .map((row) => (Array.isArray(row.staff) ? row.staff[0] : row.staff))
      .filter((row): row is StaffRow => Boolean(row?.id));

    if (staff.length === 0) return [];

    const { start, end } = getUtcDayWindow(date);
    const weekday = getWeekday(date);
    const staffIds = staff.map((member) => member.id);

    const [{ data: workingHoursData }, { data: blockedTimesData }, { data: bookingsData }] =
      await Promise.all([
        supabase
          .from("working_hours")
          .select("staff_id, start_time, end_time")
          .eq("tenant_id", salon.tenantId)
          .eq("salon_id", salon.id)
          .eq("weekday", weekday)
          .eq("is_active", true)
          .or(`staff_id.is.null,staff_id.in.(${staffIds.join(",")})`),
        supabase
          .from("blocked_times")
          .select("staff_id, starts_at, ends_at")
          .eq("tenant_id", salon.tenantId)
          .eq("salon_id", salon.id)
          .lt("starts_at", end.toISOString())
          .gt("ends_at", start.toISOString())
          .or(`staff_id.is.null,staff_id.in.(${staffIds.join(",")})`),
        supabase
          .from("bookings")
          .select("staff_id, start_time, end_time")
          .eq("tenant_id", salon.tenantId)
          .eq("salon_id", salon.id)
          .in("staff_id", staffIds)
          .in("status", ["pending", "confirmed"])
          .lt("start_time", end.toISOString())
          .gt("end_time", start.toISOString())
      ]);

    const workingHours = (workingHoursData ?? []) as WorkingHourRow[];
    const blockedTimes = (blockedTimesData ?? []) as WindowRow[];
    const bookings = (bookingsData ?? []) as BookingRow[];
    const salonHours = workingHours.filter((row) => row.staff_id === null);

    return staff.map((member) => {
      const staffHours = workingHours.filter((row) => row.staff_id === member.id);
      const applicableHours = staffHours.length > 0 ? staffHours : salonHours;
      const workingWindows = applicableHours.map((row) => ({
        start: timeOnDate(date, row.start_time),
        end: timeOnDate(date, row.end_time)
      }));
      const blockedWindows = blockedTimes
        .filter((row) => row.staff_id === null || row.staff_id === member.id)
        .map(rowToWindow);
      const existingBookings = bookings
        .filter((row) => row.staff_id === member.id)
        .map((row) => ({
          start: new Date(row.start_time),
          end: new Date(row.end_time)
        }));

      return {
        staffId: member.id,
        staffName: member.display_name,
        slots: generateAvailabilitySlots({
          workingWindows,
          blockedWindows,
          existingBookings,
          durationMinutes: service.duration_minutes,
          bufferMinutes: service.buffer_minutes,
          slotIntervalMinutes: salon.slotIntervalMinutes
        }).map((slot) => ({
          ...slot,
          staffId: member.id
        }))
      };
    });
  }
);
