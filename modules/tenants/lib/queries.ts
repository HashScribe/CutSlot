import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TenantRole } from "./types";

export type ActiveTenant = {
  id: string;
  name: string;
  role: TenantRole;
};

type TenantMembershipRow = {
  tenant_id: string;
  role: TenantRole;
  tenants:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

export const getActiveTenantForUser = cache(async (userId: string): Promise<ActiveTenant | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenant_users")
    .select("tenant_id, role, tenants(id, name)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as unknown as TenantMembershipRow;
  const tenant = Array.isArray(row.tenants) ? row.tenants[0] : row.tenants;

  return {
    id: tenant?.id ?? row.tenant_id,
    name: tenant?.name ?? "CutSlot tenant",
    role: row.role
  };
});

export async function requireActiveTenant(userId: string) {
  const tenant = await getActiveTenantForUser(userId);

  if (!tenant) {
    return null;
  }

  return tenant;
}
