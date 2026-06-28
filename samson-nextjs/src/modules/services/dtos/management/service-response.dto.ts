import { z } from 'zod';

export const serviceDbSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  duration_minutes: z.number().int().positive(),
  price: z.number().nonnegative().nullable().optional(),
  service_type: z.enum(["GENERAL", "SPECIALIZED"]).default("GENERAL"),
  is_active: z.boolean().default(true),
  image_url: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "HIDDEN", "ARCHIVED"]).default("ACTIVE").optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const serviceResponseSchema = serviceDbSchema.transform((record) => {
  const result: any = {
    id: record.id,
    name: record.name,
    description: record.description ?? null,
    durationMinutes: record.duration_minutes,
    price: record.price ?? null,
    serviceType: record.service_type,
    isActive: record.is_active,
    status: record.status || (record.is_active ? 'ACTIVE' : 'HIDDEN'),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
  if (record.image_url !== undefined) {
    result.imageUrl = record.image_url;
  }
  return result as {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: number | null;
    serviceType: "GENERAL" | "SPECIALIZED";
    isActive: boolean;
    status: "ACTIVE" | "HIDDEN" | "ARCHIVED";
    imageUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
});

export type ServiceResponseDto = z.infer<typeof serviceResponseSchema>;
