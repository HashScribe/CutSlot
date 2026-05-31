import { z } from "zod";
import { databaseUuidSchema } from "@/lib/validations/uuid";

export const createBookingSchema = z.object({
  salonId: databaseUuidSchema,
  serviceId: databaseUuidSchema,
  staffId: databaseUuidSchema,
  startTime: z.string().datetime(),
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(6).max(32),
  notes: z.string().max(1000).optional()
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
