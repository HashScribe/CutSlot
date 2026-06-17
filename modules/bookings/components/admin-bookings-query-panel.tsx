"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import type { Salon } from "@/modules/salons/lib/types";
import type { Service } from "@/modules/services/lib/types";
import type { StaffMember, StaffService } from "@/modules/staff/lib/types";
import { AdminBookingsPanel } from "./admin-bookings-panel";
import type { BookingWithDetails } from "../lib/types";

type AdminBookingsData = {
  salon: Salon | null;
  bookings: BookingWithDetails[];
  services: Service[];
  staff: StaffMember[];
  assignments: StaffService[];
};

async function fetchBookingsData(): Promise<AdminBookingsData> {
  const response = await fetch("/api/admin/bookings", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unable to load bookings.");
  }

  return response.json() as Promise<AdminBookingsData>;
}

function BookingsSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <div className="h-5 w-36 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-28 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-5 w-44 animate-pulse rounded-md bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="h-4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="h-20 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminBookingsQueryPanel() {
  const { data, error, isFetching, isLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: fetchBookingsData,
    staleTime: 0,
    refetchOnMount: "always"
  });

  if (isLoading) {
    return <BookingsSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Bookings could not be loaded. Please refresh the page.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.salon) {
    return <NoSalonState />;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs text-muted-foreground">Refreshing bookings...</p> : null}
      <AdminBookingsPanel
        assignments={data.assignments}
        bookings={data.bookings}
        bookingPolicy={data.salon}
        salonId={data.salon.id}
        salonSlug={data.salon.slug}
        services={data.services}
        staff={data.staff}
      />
    </div>
  );
}
