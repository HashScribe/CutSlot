export type CustomerWithStats = {
  id: string;
  tenantId: string;
  salonId: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  bookingCount: number;
  nextBookingAt?: string | null;
  lastBookingAt?: string | null;
};
