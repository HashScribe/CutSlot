import { Building2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TenantRole } from "@/modules/tenants/lib/types";

export function TenantOverview({
  tenantName,
  tenantRole
}: {
  tenantName?: string;
  tenantRole?: TenantRole;
}) {
  return (
    <Card className="bg-gradient-to-br from-card to-secondary/40">
      <CardContent className="grid gap-5 p-5 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Tenant-aware foundation
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-normal">Ready for multi-tenant salon operations</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {tenantName
              ? `${tenantName} is resolved from authenticated tenant membership.`
              : "Every feature module is shaped around tenant-owned data so Phase 1 can grow into a real SaaS without a later rewrite."}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-4">
          <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">{tenantRole ? `Active role: ${tenantRole}` : "Next setup step"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tenantRole ? "Tenant-scoped dashboard access is active." : "Connect Supabase Auth and resolve the active tenant from membership."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
