export type Service = {
  id: string;
  tenantId: string;
  salonId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  bufferMinutes: number;
  priceCents?: number | null;
  isActive: boolean;
};
