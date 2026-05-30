import { z } from 'zod';

export const patientProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  suffix: z.string().nullable().optional(),
  phoneNumber: z.string(),
  dateOfBirth: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type PatientProfileDto = z.infer<typeof patientProfileSchema>;

type MaybeRecord = Record<string, unknown>;

const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
const nullableStringValue = (value: unknown) =>
  typeof value === 'string' && value.length > 0 ? value : null;

export const mapPatientProfile = (record: MaybeRecord): PatientProfileDto => ({
  id: stringValue(record.id),
  email: stringValue(record.email),
  firstName: stringValue(record.first_name ?? record.firstName),
  middleName: nullableStringValue(record.middle_name ?? record.middleName),
  lastName: stringValue(record.last_name ?? record.lastName),
  suffix: nullableStringValue(record.suffix),
  phoneNumber: stringValue(record.phone ?? record.phone_number ?? record.phoneNumber),
  dateOfBirth: stringValue(record.date_of_birth ?? record.dateOfBirth),
  avatarUrl: nullableStringValue(record.avatar_url ?? record.avatarUrl),
  createdAt: typeof record.created_at === 'string' ? record.created_at : undefined,
  updatedAt: typeof record.updated_at === 'string' ? record.updated_at : undefined,
});
