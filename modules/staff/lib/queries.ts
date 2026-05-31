import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffMember, StaffService } from "./types";

type StaffRow = {
  id: string;
  tenant_id: string;
  salon_id: string;
  display_name: string;
  phone: string | null;
  is_active: boolean;
};

function mapStaff(row: StaffRow): StaffMember {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    salonId: row.salon_id,
    displayName: row.display_name,
    phone: row.phone,
    isActive: row.is_active
  };
}

export const listStaffForSalon = cache(async (tenantId: string, salonId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, tenant_id, salon_id, display_name, phone, is_active")
    .eq("tenant_id", tenantId)
    .eq("salon_id", salonId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as StaffRow[]).map(mapStaff);
});

export const listActiveStaffForSalon = cache(async (tenantId: string, salonId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, tenant_id, salon_id, display_name, phone, is_active")
    .eq("tenant_id", tenantId)
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as StaffRow[]).map(mapStaff);
});

export const listStaffServicesForTenant = cache(async (tenantId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("staff_services")
    .select("staff_id, service_id")
    .eq("tenant_id", tenantId);

  if (error || !data) {
    return [];
  }

  return (data as { staff_id: string; service_id: string }[]).map((row) => ({
    staffId: row.staff_id,
    serviceId: row.service_id
  })) satisfies StaffService[];
});

export const listPublicStaffServicesForTenant = cache(async (tenantId: string) => {
  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch {
    supabase = await createSupabaseServerClient();
  }

  const { data, error } = await supabase
    .from("staff_services")
    .select("staff_id, service_id")
    .eq("tenant_id", tenantId);

  if (error || !data) {
    return [];
  }

  return (data as { staff_id: string; service_id: string }[]).map((row) => ({
    staffId: row.staff_id,
    serviceId: row.service_id
  })) satisfies StaffService[];
});
