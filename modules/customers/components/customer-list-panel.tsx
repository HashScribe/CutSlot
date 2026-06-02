import { CalendarDays, Phone, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerWithStats } from "@/modules/customers/lib/types";

function formatDate(value?: string | null) {
  if (!value) return "None";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function CustomerListPanel({ customers }: { customers: CustomerWithStats[] }) {
  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="font-medium">No customers yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Customers are created automatically from customer and admin bookings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {customers.map((customer) => (
        <Card key={customer.id}>
          <CardHeader>
            <CardTitle className="flex items-start justify-between gap-3">
              <span className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                {customer.name}
              </span>
              <Badge variant="muted">{customer.bookingCount} bookings</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
              {customer.phone}
            </p>
            <p className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
              <span>
                Next: {formatDate(customer.nextBookingAt)}
                <br />
                Last: {formatDate(customer.lastBookingAt)}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
