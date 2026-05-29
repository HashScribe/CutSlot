"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseUuidSchema } from "@/lib/validations/uuid";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

const salonSchema = z.object({
  salonId: databaseUuidSchema,
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  phone: z.string().max(32).optional(),
  address: z.string().max(240).optional(),
  logoUrl: z.string().url().max(1000).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  themeMode: z.enum(["light", "dark"])
});

export async function updateSalonAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const payload = salonSchema.parse({
    salonId: formData.get("salonId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    address: String(formData.get("address") ?? "").trim() || undefined,
    logoUrl: String(formData.get("logoUrl") ?? "").trim() || undefined,
    accentColor: formData.get("accentColor"),
    themeMode: formData.get("themeMode")
  });

  const supabase = await createSupabaseServerClient();
  const { data: currentSalon } = await supabase
    .from("salons")
    .select("slug")
    .eq("tenant_id", context.tenant.id)
    .eq("id", payload.salonId)
    .maybeSingle();

  await supabase
    .from("salons")
    .update({
      name: payload.name,
      slug: payload.slug,
      phone: payload.phone ?? null,
      address: payload.address ?? null,
      logo_url: payload.logoUrl ?? null,
      accent_color: payload.accentColor,
      theme_mode: payload.themeMode,
      updated_at: new Date().toISOString()
    })
    .eq("tenant_id", context.tenant.id)
    .eq("id", payload.salonId);

  revalidatePath("/admin/settings");
  revalidatePath(`/${payload.slug}`);
  if (currentSalon?.slug && currentSalon.slug !== payload.slug) {
    revalidatePath(`/${currentSalon.slug}`);
  }
}

export async function createWorkingHourAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const salonId = String(formData.get("salonId") ?? "");
  const weekday = Number(formData.get("weekday"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const supabase = await createSupabaseServerClient();

  await supabase.from("working_hours").insert({
    tenant_id: context.tenant.id,
    salon_id: salonId,
    weekday,
    start_time: startTime,
    end_time: endTime,
    is_active: true
  });

  revalidatePath("/admin/settings");
}

export async function deleteWorkingHourAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const workingHourId = String(formData.get("workingHourId") ?? "");
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("working_hours")
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("id", workingHourId);

  revalidatePath("/admin/settings");
}
