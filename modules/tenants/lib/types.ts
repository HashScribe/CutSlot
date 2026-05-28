export type TenantRole = "owner" | "admin" | "staff";

export type Tenant = {
  id: string;
  name: string;
  createdAt: string;
};

export type TenantMembership = {
  tenantId: string;
  userId: string;
  role: TenantRole;
};
