import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Service } from "./types";

type ServiceRow = {
  id: string;
  tenant_id: string;
  salon_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_minutes: number;
  price_cents: number | null;
  is_active: boolean;
};

function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    salonId: row.salon_id,
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    bufferMinutes: row.buffer_minutes,
    priceCents: row.price_cents,
    isActive: row.is_active
  };
}

export const listServicesForSalon = cache(async (tenantId: string, salonId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, tenant_id, salon_id, name, description, duration_minutes, buffer_minutes, price_cents, is_active")
    .eq("tenant_id", tenantId)
    .eq("salon_id", salonId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as ServiceRow[]).map(mapService);
});

export const listActiveServicesForSalon = cache(async (tenantId: string, salonId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, tenant_id, salon_id, name, description, duration_minutes, buffer_minutes, price_cents, is_active")
    .eq("tenant_id", tenantId)
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as ServiceRow[]).map(mapService);
});
