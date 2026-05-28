import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BookingListPlaceholder() {
  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {["Pending booking requests", "Confirmed appointments", "Completed visits"].map((label) => (
          <div key={label} className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">Connected to booking data in the next phase.</p>
            </div>
            <Badge variant="muted">0</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
