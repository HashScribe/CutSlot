"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";

const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  durationMinutes: z.coerce.number().int().positive().max(720),
  bufferMinutes: z.coerce.number().int().min(0).max(180),
  priceCents: z.coerce.number().int().min(0).nullable().optional(),
  isActive: z.boolean()
});

function getOptionalPriceCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  return Math.round(Number(raw) * 100);
}

function getPayload(formData: FormData) {
  return serviceSchema.parse({
    name: formData.get("name"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    durationMinutes: formData.get("durationMinutes"),
    bufferMinutes: formData.get("bufferMinutes"),
    priceCents: getOptionalPriceCents(formData.get("price")),
    isActive: formData.get("isActive") === "on"
  });
}

export async function createServiceAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const salon = await getPrimarySalonForTenant(context.tenant.id);
  if (!salon) return;

  const payload = getPayload(formData);
  const supabase = await createSupabaseServerClient();

  await supabase.from("services").insert({
    tenant_id: context.tenant.id,
    salon_id: salon.id,
    name: payload.name,
    description: payload.description ?? null,
    duration_minutes: payload.durationMinutes,
    buffer_minutes: payload.bufferMinutes,
    price_cents: payload.priceCents ?? null,
    is_active: payload.isActive
  });

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function updateServiceAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const serviceId = String(formData.get("serviceId") ?? "");
  const payload = getPayload(formData);
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("services")
    .update({
      name: payload.name,
      description: payload.description ?? null,
      duration_minutes: payload.durationMinutes,
      buffer_minutes: payload.bufferMinutes,
      price_cents: payload.priceCents ?? null,
      is_active: payload.isActive,
      updated_at: new Date().toISOString()
    })
    .eq("tenant_id", context.tenant.id)
    .eq("id", serviceId);

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function deleteServiceAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const serviceId = String(formData.get("serviceId") ?? "");
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("services")
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("id", serviceId);

  revalidatePath("/admin/services");
  revalidatePath("/admin/staff");
  redirect("/admin/services");
}
