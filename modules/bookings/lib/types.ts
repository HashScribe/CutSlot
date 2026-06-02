export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";

export type Booking = {
  id: string;
  tenantId: string;
  salonId: string;
  customerId: string;
  staffId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string | null;
  createdAt: string;
};

export type BookingWithDetails = Booking & {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  serviceDurationMinutes: number;
  serviceBufferMinutes: number;
  staffName: string;
};

export type Customer = {
  id: string;
  tenantId: string;
  salonId: string;
  name: string;
  phone: string;
};
