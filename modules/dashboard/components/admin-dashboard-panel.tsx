"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantOverview } from "@/modules/tenants/components/tenant-overview";
import type { AdminDashboardData } from "../lib/types";

async function fetchDashboardData(): Promise<AdminDashboardData> {
  const response = await fetch("/api/admin/dashboard", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unable to load dashboard data.");
  }

  return response.json() as Promise<AdminDashboardData>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded-md bg-muted" />
      </div>
      <Card>
        <CardContent className="grid gap-5 p-5 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <div className="h-4 w-36 animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-80 max-w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-28 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-9 w-14 animate-pulse rounded-md bg-muted" />
              <div className="mt-3 h-4 w-full animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardPanel() {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboardData
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Your salon command center for today’s appointments." />
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Dashboard data could not be loaded. Please refresh the page.
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    ["Today’s bookings", String(data.metrics.todayBookings), "Pending and confirmed bookings scheduled for today."],
    ["Active services", String(data.metrics.activeServices), "Public services available for customer booking."],
    ["Active staff", String(data.metrics.activeStaff), "Staff profiles currently active for booking."]
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          data.tenant
            ? `Your salon command center for ${data.tenant.name}.`
            : "Your salon command center for today’s appointments, setup progress, and booking health."
        }
      />
      {isFetching ? <p className="text-xs text-muted-foreground">Refreshing dashboard data...</p> : null}
      <TenantOverview tenantName={data.tenant?.name} tenantRole={data.tenant?.role} />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(([title, value, description]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {title}
                <Badge variant="muted">Phase 1</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
