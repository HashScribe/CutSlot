"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

const staffSchema = z.object({
  displayName: z.string().min(2).max(120),
  phone: z.string().max(32).optional(),
  isActive: z.boolean()
});

function getPayload(formData: FormData) {
  return staffSchema.parse({
    displayName: formData.get("displayName"),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    isActive: formData.get("isActive") === "on"
  });
}

async function syncStaffServices(tenantId: string, staffId: string, serviceIds: string[]) {
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("staff_services")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("staff_id", staffId);

  if (serviceIds.length === 0) {
    return;
  }

  await supabase.from("staff_services").insert(
    serviceIds.map((serviceId) => ({
      tenant_id: tenantId,
      staff_id: staffId,
      service_id: serviceId
    }))
  );
}

export async function createStaffAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const salon = await getPrimarySalonForTenant(context.tenant.id);
  if (!salon) return;

  const payload = getPayload(formData);
  const serviceIds = formData.getAll("serviceIds").map(String);
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("staff")
    .insert({
      tenant_id: context.tenant.id,
      salon_id: salon.id,
      display_name: payload.displayName,
      phone: payload.phone ?? null,
      is_active: payload.isActive
    })
    .select("id")
    .single();

  if (data?.id) {
    await syncStaffServices(context.tenant.id, data.id, serviceIds);
  }

  revalidatePath("/admin/staff");
}

export async function updateStaffAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const staffId = String(formData.get("staffId") ?? "");
  const payload = getPayload(formData);
  const serviceIds = formData.getAll("serviceIds").map(String);
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("staff")
    .update({
      display_name: payload.displayName,
      phone: payload.phone ?? null,
      is_active: payload.isActive,
      updated_at: new Date().toISOString()
    })
    .eq("tenant_id", context.tenant.id)
    .eq("id", staffId);

  await syncStaffServices(context.tenant.id, staffId, serviceIds);

  revalidatePath("/admin/staff");
}

export async function deleteStaffAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const staffId = String(formData.get("staffId") ?? "");
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("staff")
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("id", staffId);

  revalidatePath("/admin/staff");
}
