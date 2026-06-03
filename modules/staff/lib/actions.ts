"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseUuidSchema } from "@/lib/validations/uuid";
import { getPrimarySalonForTenant } from "@/modules/salons/lib/queries";
import { getAdminTenantContext } from "@/modules/tenants/lib/context";

const staffSchema = z.object({
  displayName: z.string().min(2).max(120),
  phone: z.string().max(32).optional(),
  isActive: z.boolean()
});

const staffWorkingHourSchema = z.object({
  salonId: databaseUuidSchema,
  staffId: databaseUuidSchema,
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
}).refine((value) => value.startTime < value.endTime, {
  message: "Start time must be before end time.",
  path: ["endTime"]
});

export type StaffWorkingHourActionState = {
  error?: string;
  success?: string;
  staffId?: string;
  weekday?: number;
};

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
  redirect("/admin/staff");
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
  redirect("/admin/staff");
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
  redirect("/admin/staff");
}

export async function saveStaffWorkingHourAction(
  _state: StaffWorkingHourActionState,
  formData: FormData
): Promise<StaffWorkingHourActionState> {
  const context = await getAdminTenantContext();
  if (!context) {
    return { error: "You need an active tenant before saving staff hours." };
  }

  const parsed = staffWorkingHourSchema.safeParse({
    salonId: formData.get("salonId"),
    staffId: formData.get("staffId"),
    weekday: formData.get("weekday"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the staff working-hours values.",
      staffId: String(formData.get("staffId") ?? ""),
      weekday: Number(formData.get("weekday") ?? 1)
    };
  }

  const payload = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data: existingHour } = await supabase
    .from("working_hours")
    .select("id")
    .eq("tenant_id", context.tenant.id)
    .eq("salon_id", payload.salonId)
    .eq("staff_id", payload.staffId)
    .eq("weekday", payload.weekday)
    .maybeSingle();

  if (existingHour?.id) {
    await supabase
      .from("working_hours")
      .update({
        start_time: payload.startTime,
        end_time: payload.endTime,
        is_active: true
      })
      .eq("tenant_id", context.tenant.id)
      .eq("id", existingHour.id);
  } else {
    await supabase.from("working_hours").insert({
      tenant_id: context.tenant.id,
      salon_id: payload.salonId,
      staff_id: payload.staffId,
      weekday: payload.weekday,
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_active: true
    });
  }

  revalidatePath("/admin/staff");

  return {
    success: "Staff hours saved.",
    staffId: payload.staffId,
    weekday: payload.weekday
  };
}

export async function deleteStaffWorkingHourAction(formData: FormData) {
  const context = await getAdminTenantContext();
  if (!context) return;

  const workingHourId = String(formData.get("workingHourId") ?? "");
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("working_hours")
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("id", workingHourId);

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}
