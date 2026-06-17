"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import type { WorkingHour } from "@/modules/salons/lib/working-hours";
import type { Service } from "@/modules/services/lib/types";
import type { StaffMember, StaffService } from "../lib/types";
import { StaffSetupPanel } from "./staff-setup-panel";

type AdminStaffData = {
  salon: {
    id: string;
    name: string;
    slug: string;
  } | null;
  staff: StaffMember[];
  services: Service[];
  assignments: StaffService[];
  staffWorkingHours: WorkingHour[];
};

async function fetchStaffData(): Promise<AdminStaffData> {
  const response = await fetch("/api/admin/staff", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unable to load staff.");
  }

  return response.json() as Promise<AdminStaffData>;
}

function StaffSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-5 w-36 animate-pulse rounded-md bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-20 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-36 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminStaffQueryPanel() {
  const { data, error, isFetching, isLoading } = useQuery({
    queryKey: ["admin", "staff"],
    queryFn: fetchStaffData,
    staleTime: 0,
    refetchOnMount: "always"
  });

  if (isLoading) {
    return <StaffSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Staff data could not be loaded. Please refresh the page.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.salon) {
    return <NoSalonState />;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs text-muted-foreground">Refreshing staff...</p> : null}
      <StaffSetupPanel
        salonId={data.salon.id}
        staff={data.staff}
        services={data.services}
        assignments={data.assignments}
        staffWorkingHours={data.staffWorkingHours}
      />
    </div>
  );
}
