import { z } from 'zod';
import { StaffRoleEnum } from './create-staff.dto';

export const staffProfileSchema = z.preprocess(
  (record: any) => {
    if (!record || typeof record !== 'object') return record;
    const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
    const nullableStringValue = (value: unknown) =>
      typeof value === 'string' && value.length > 0 ? value : null;

    return {
      id: stringValue(record.id),
      email: nullableStringValue(record.email),
      firstName: stringValue(record.first_name ?? record.firstName),
      middleName: nullableStringValue(record.middle_name ?? record.middleName),
      lastName: stringValue(record.last_name ?? record.lastName),
      suffix: nullableStringValue(record.suffix),
      phoneNumber: nullableStringValue(record.phone ?? record.phone_number ?? record.phoneNumber),
      role: record.role ?? 'SECRETARY',
      createdAt: typeof record.created_at === 'string' ? record.created_at : record.createdAt,
      updatedAt: typeof record.updated_at === 'string' ? record.updated_at : record.updatedAt,
    };
  },
  z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable().optional(),
    firstName: z.string(),
    middleName: z.string().nullable().optional(),
    lastName: z.string(),
    suffix: z.string().nullable().optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Must be a valid E.164 phone number").nullable().optional(),
    role: StaffRoleEnum,
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
);

export type StaffProfileDto = z.infer<typeof staffProfileSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapStaffProfile = (record: MaybeRecord): StaffProfileDto => {
  return staffProfileSchema.parse(record);
};
