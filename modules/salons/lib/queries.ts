import { cache } from "react";
import { hasSupabaseConfig } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Salon } from "./types";

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
};

export const getPrimarySalonForTenant = cache(async (tenantId: string): Promise<Salon | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("salons")
    .select("id, tenant_id, name, slug, phone, address, logo_url, accent_color, theme_mode")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as SalonRow;

  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    phone: row.phone,
    address: row.address,
    logoUrl: row.logo_url,
    accentColor: row.accent_color,
    themeMode: row.theme_mode
  };
});

export const getSalonBySlug = cache(async (slug: string): Promise<Salon | null> => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("salons")
    .select("id, tenant_id, name, slug, phone, address, logo_url, accent_color, theme_mode")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as SalonRow;

  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    phone: row.phone,
    address: row.address,
    logoUrl: row.logo_url,
    accentColor: row.accent_color,
    themeMode: row.theme_mode
  };
});
