import { z } from 'zod';
import { dependentRelationshipEnum } from './create-dependent.dto';

export const dependentProfileSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  relationship: dependentRelationshipEnum,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type DependentProfileDto = z.infer<typeof dependentProfileSchema>;

type MaybeRecord = Record<string, unknown>;

const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');

export const mapDependentProfile = (record: MaybeRecord): DependentProfileDto => ({
  id: stringValue(record.id),
  patientId: stringValue(record.patient_id ?? record.patientId),
  firstName: stringValue(record.first_name ?? record.firstName),
  lastName: stringValue(record.last_name ?? record.lastName),
  dateOfBirth: stringValue(record.date_of_birth ?? record.dateOfBirth),
  relationship: (record.relationship as DependentProfileDto['relationship']) ?? 'OTHER',
  createdAt: typeof record.created_at === 'string' ? record.created_at : undefined,
  updatedAt: typeof record.updated_at === 'string' ? record.updated_at : undefined,
});

export const mapDependentProfiles = (records: MaybeRecord[]): DependentProfileDto[] =>
  records.map((r) => mapDependentProfile(r));
