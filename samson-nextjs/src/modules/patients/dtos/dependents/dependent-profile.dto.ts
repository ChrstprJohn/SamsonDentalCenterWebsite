import { z } from 'zod';
import { dependentRelationshipEnum } from './create-dependent.dto';

export const dependentProfileSchema = z.preprocess(
  (record: any) => {
    if (!record || typeof record !== 'object') return record;
    const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');

    return {
      id: stringValue(record.id),
      patientId: stringValue(record.patient_id ?? record.patientId),
      firstName: stringValue(record.first_name ?? record.firstName),
      middleName: record.middle_name ?? record.middleName,
      lastName: stringValue(record.last_name ?? record.lastName),
      suffix: record.suffix ?? record.suffix,
      dateOfBirth: stringValue(record.date_of_birth ?? record.dateOfBirth),
      relationship: record.relationship ?? 'OTHER',
      createdAt: typeof record.created_at === 'string' ? record.created_at : record.createdAt,
      updatedAt: typeof record.updated_at === 'string' ? record.updated_at : record.updatedAt,
    };
  },
  z.object({
    id: z.string().uuid(),
    patientId: z.string().uuid(),
    firstName: z.string(),
    middleName: z.string().optional().nullable(),
    lastName: z.string(),
    suffix: z.string().optional().nullable(),
    dateOfBirth: z.string(),
    relationship: dependentRelationshipEnum,
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
);

export type DependentProfileDto = z.infer<typeof dependentProfileSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapDependentProfile = (record: MaybeRecord): DependentProfileDto => {
  return dependentProfileSchema.parse(record);
};

export const mapDependentProfiles = (records: MaybeRecord[]): DependentProfileDto[] =>
  records.map((r) => mapDependentProfile(r));

