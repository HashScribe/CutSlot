import type { TenantRole } from "@/modules/tenants/lib/types";

export type AdminDashboardData = {
  tenant: {
    id: string;
    name: string;
    role: TenantRole;
  } | null;
  salon: {
    id: string;
    name: string;
    slug: string;
  } | null;
  metrics: {
    todayBookings: number;
    activeServices: number;
    activeStaff: number;
  };
};
