import { Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalonBrandingPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" aria-hidden="true" />
          Salon branding
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        {["Logo", "Public theme", "Booking link", "WhatsApp"].map((item) => (
          <div key={item} className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-sm font-medium">{item}</p>
            <p className="mt-1 text-xs text-muted-foreground">Configured in Phase 1 settings.</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
