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
  themeMode: z.enum(["light", "dark"]),
  slotIntervalMinutes: z.coerce.number().int().refine((value) => [5, 10, 15, 20, 30, 45, 60].includes(value))
});

const workingHourSchema = z.object({
  salonId: databaseUuidSchema,
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
}).refine((value) => value.startTime < value.endTime, {
  message: "Start time must be before end time.",
  path: ["endTime"]
});

export type WorkingHourActionState = {
  error?: string;
  success?: string;
  weekday?: number;
};

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
    themeMode: formData.get("themeMode"),
    slotIntervalMinutes: formData.get("slotIntervalMinutes")
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
      slot_interval_minutes: payload.slotIntervalMinutes,
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

export async function saveWorkingHourAction(
  _state: WorkingHourActionState,
  formData: FormData
): Promise<WorkingHourActionState> {
  const context = await getAdminTenantContext();
  if (!context) {
    return { error: "You need an active tenant before saving working hours." };
  }

  const parsed = workingHourSchema.safeParse({
    salonId: formData.get("salonId"),
    weekday: formData.get("weekday"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the working-hours values.",
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
    .eq("weekday", payload.weekday)
    .is("staff_id", null)
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
      weekday: payload.weekday,
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_active: true
    });
  }

  revalidatePath("/admin/settings");

  return {
    success: "Working hours saved.",
    weekday: payload.weekday
  };
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
