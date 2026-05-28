import { z } from "zod";

export const createBookingSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(6).max(32),
  notes: z.string().max(1000).optional()
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
