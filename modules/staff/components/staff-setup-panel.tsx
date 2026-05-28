import { UserRoundCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StaffSetupPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRoundCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          Staff foundation
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {["Senior stylist", "Color specialist", "Any available staff"].map((role) => (
          <div key={role} className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="font-medium">{role}</p>
            <p className="mt-1 text-sm text-muted-foreground">Working hours and service assignments come next.</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
