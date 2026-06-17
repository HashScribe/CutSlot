"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { AdminCalendarPanel } from "./admin-calendar-panel";
import type { BookingWithDetails } from "../lib/types";

type AdminCalendarData = {
  salon: {
    id: string;
    name: string;
    slug: string;
  } | null;
  days: string[];
  bookings: BookingWithDetails[];
};

async function fetchCalendarData(): Promise<AdminCalendarData> {
  const response = await fetch("/api/admin/calendar", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unable to load calendar data.");
  }

  return response.json() as Promise<AdminCalendarData>;
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="h-5 w-44 animate-pulse rounded-md bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-20 animate-pulse rounded-md bg-muted" />
            <div className="h-20 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminCalendarQueryPanel() {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin", "calendar"],
    queryFn: fetchCalendarData
  });

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Calendar data could not be loaded. Please refresh the page.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.salon) {
    return <NoSalonState />;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs text-muted-foreground">Refreshing calendar data...</p> : null}
      <AdminCalendarPanel bookings={data.bookings} days={data.days} />
    </div>
  );
}
