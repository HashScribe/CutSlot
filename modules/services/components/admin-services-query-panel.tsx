"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import type { Service } from "../lib/types";
import { ServiceSetupPanel } from "./service-setup-panel";

type AdminServicesData = {
  salon: {
    id: string;
    name: string;
    slug: string;
  } | null;
  services: Service[];
};

async function fetchServicesData(): Promise<AdminServicesData> {
  const response = await fetch("/api/admin/services", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unable to load services.");
  }

  return response.json() as Promise<AdminServicesData>;
}

function ServicesSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-24 animate-pulse rounded-md bg-muted" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-20 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminServicesQueryPanel() {
  const { data, error, isFetching, isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: fetchServicesData,
    staleTime: 0,
    refetchOnMount: "always"
  });

  if (isLoading) {
    return <ServicesSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Services could not be loaded. Please refresh the page.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.salon) {
    return <NoSalonState />;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs text-muted-foreground">Refreshing services...</p> : null}
      <ServiceSetupPanel services={data.services} />
    </div>
  );
}
