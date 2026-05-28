import { Card, CardContent } from "@/components/ui/card";

const hours = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];

export function BookingCalendarPlaceholder() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="grid grid-cols-[80px_1fr] gap-3">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              <div className="text-sm text-muted-foreground">{hour}</div>
              <div className="min-h-14 rounded-md border border-dashed border-border bg-secondary/20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
