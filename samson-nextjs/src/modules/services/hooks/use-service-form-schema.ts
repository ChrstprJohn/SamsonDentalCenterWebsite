import { z } from 'zod';

export const createServiceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  durationMinutes: z.coerce.number().int().positive("Duration must be positive"),
  price: z.coerce.number().nonnegative("Price cannot be negative").optional().nullable(),
  serviceType: z.enum(["GENERAL", "SPECIALIZED"]).default("GENERAL"),
  isActive: z.boolean().default(true),
  imageUrl: z.string().optional().nullable(),
  imageFile: z.any().optional(),
});

export type CreateServiceFormValues = z.infer<typeof createServiceFormSchema>;
