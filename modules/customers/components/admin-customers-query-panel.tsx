"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoSalonState } from "@/modules/salons/components/no-salon-state";
import { CustomerListPanel } from "./customer-list-panel";
import type { CustomerWithStats } from "../lib/types";

type AdminCustomersData = {
  salon: {
    id: string;
    name: string;
    slug: string;
  } | null;
  customers: CustomerWithStats[];
};

async function fetchCustomersData(): Promise<AdminCustomersData> {
  const response = await fetch("/api/admin/customers", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unable to load customers.");
  }

  return response.json() as Promise<AdminCustomersData>;
}

function CustomersSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="h-5 w-36 animate-pulse rounded-md bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminCustomersQueryPanel() {
  const { data, error, isFetching, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: fetchCustomersData,
    staleTime: 0,
    refetchOnMount: "always"
  });

  if (isLoading) {
    return <CustomersSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customers unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Customers could not be loaded. Please refresh the page.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.salon) {
    return <NoSalonState />;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs text-muted-foreground">Refreshing customers...</p> : null}
      <CustomerListPanel customers={data.customers} />
    </div>
  );
}
