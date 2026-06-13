import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  durationMinutes: z.number().int().positive("Duration must be positive"),
  price: z.number().nonnegative("Price cannot be negative").optional().nullable(),
  serviceType: z.enum(["GENERAL", "SPECIALIZED"]).default("GENERAL"),
  isActive: z.boolean().default(true),
});

export type CreateServiceDto = z.infer<typeof createServiceSchema>;

