import { Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NoTenantState() {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-4 w-4" aria-hidden="true" />
        </div>
        <CardTitle>No tenant membership found</CardTitle>
        <CardDescription>
          Your login works, but this user is not connected to a salon tenant yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Add a row in <span className="font-medium text-foreground">tenant_users</span> linking this auth user to a tenant, then refresh the dashboard.
        </p>
      </CardContent>
    </Card>
  );
}
