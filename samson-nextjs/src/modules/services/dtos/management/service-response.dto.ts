import { z } from "zod";

export const ServiceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  duration_minutes: z.number(),
  price: z.number().nullable(),
  service_type: z.enum(["GENERAL", "SPECIALIZED"]),
  is_active: z.boolean(),
});

export type ServiceResponseDto = z.infer<typeof ServiceResponseSchema>;

