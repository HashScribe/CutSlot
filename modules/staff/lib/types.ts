export type StaffMember = {
  id: string;
  tenantId: string;
  salonId: string;
  displayName: string;
  phone?: string | null;
  isActive: boolean;
};

export type StaffService = {
  staffId: string;
  serviceId: string;
};
