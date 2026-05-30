import { z } from "zod";

export const CreateServiceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  duration_minutes: z.number().int().positive("Duration must be positive"),
  price: z.number().nonnegative("Price cannot be negative").optional().nullable(),
  service_type: z.enum(["GENERAL", "SPECIALIZED"]).default("GENERAL"),
  is_active: z.boolean().default(true),
});

export type CreateServiceDto = z.infer<typeof CreateServiceSchema>;

