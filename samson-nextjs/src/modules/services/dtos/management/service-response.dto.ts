import { z } from "zod";

export const ServiceResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  durationMinutes: z.number().int().positive(),
  price: z.number().nonnegative().nullable().optional(),
  serviceType: z.enum(["GENERAL", "SPECIALIZED"]),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ServiceResponseDto = z.infer<typeof ServiceResponseSchema>;

type MaybeRecord = Record<string, unknown>;

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");
const nullableStringValue = (value: unknown) => (typeof value === "string" ? value : null);
const numberValue = (value: unknown, fallback = 0) => (typeof value === "number" ? value : fallback);
const nullableNumberValue = (value: unknown) => (typeof value === "number" ? value : null);
const booleanValue = (value: unknown, fallback = false) => (typeof value === "boolean" ? value : fallback);

export const mapServiceRecord = (record: MaybeRecord): ServiceResponseDto => ({
  id: stringValue(record.id),
  name: stringValue(record.name),
  description: nullableStringValue(record.description),
  durationMinutes: numberValue(record.duration_minutes ?? record.durationMinutes),
  price: nullableNumberValue(record.price),
  serviceType: (record.service_type ?? record.serviceType ?? "GENERAL") as ServiceResponseDto["serviceType"],
  isActive: booleanValue(record.is_active ?? record.isActive, true),
  createdAt: typeof record.created_at === "string" ? record.created_at : undefined,
  updatedAt: typeof record.updated_at === "string" ? record.updated_at : undefined,
});

export const mapServiceRecords = (records: MaybeRecord[]) =>
  records.map((record) => mapServiceRecord(record));
