import { hasSupabaseConfig } from "@/lib/env";
import { requireCurrentUser } from "@/modules/auth/lib/session";
import { requireActiveTenant } from "@/modules/tenants/lib/queries";

export async function getAdminTenantContext() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const user = await requireCurrentUser();
  const tenant = await requireActiveTenant(user.id);

  if (!tenant) {
    return null;
  }

  return {
    user,
    tenant
  };
}
