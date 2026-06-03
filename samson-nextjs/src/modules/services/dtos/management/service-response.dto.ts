import { z } from "zod";

export const serviceDbSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  duration_minutes: z.number().int().positive(),
  price: z.number().nonnegative().nullable().optional(),
  service_type: z.enum(["GENERAL", "SPECIALIZED"]).default("GENERAL"),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const serviceResponseSchema = serviceDbSchema.transform((record) => ({
  id: record.id,
  name: record.name,
  description: record.description ?? null,
  durationMinutes: record.duration_minutes,
  price: record.price ?? null,
  serviceType: record.service_type,
  isActive: record.is_active,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
}));

export type ServiceResponseDto = z.infer<typeof serviceResponseSchema>;
