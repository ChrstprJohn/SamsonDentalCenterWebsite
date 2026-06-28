import { z } from 'zod';

export const patientProfileForStaffSchema = z.preprocess(
  (record: any) => {
    if (!record || typeof record !== 'object') return record;
    const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
    const nullableStringValue = (value: unknown) =>
      typeof value === 'string' && value.length > 0 ? value : null;
    const numberValue = (value: unknown) => (typeof value === 'number' ? value : 0);

    return {
      id: stringValue(record.id),
      email: stringValue(record.email),
      firstName: stringValue(record.first_name ?? record.firstName),
      middleName: nullableStringValue(record.middle_name ?? record.middleName),
      lastName: stringValue(record.last_name ?? record.lastName),
      suffix: nullableStringValue(record.suffix),
      phoneNumber: stringValue(record.phone ?? record.phone_number ?? record.phoneNumber),
      dateOfBirth: stringValue(record.date_of_birth ?? record.dateOfBirth),
      avatarUrl: nullableStringValue(record.avatar_url ?? record.avatarUrl),
      cancelCount: numberValue(record.cancel_count ?? record.cancelCount),
      noShowCount: numberValue(record.no_show_count ?? record.noShowCount),
      rescheduleCount: numberValue(record.reschedule_count ?? record.rescheduleCount),
      createdAt: typeof record.created_at === 'string' ? record.created_at : record.createdAt,
      updatedAt: typeof record.updated_at === 'string' ? record.updated_at : record.updatedAt,
    };
  },
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    middleName: z.string().nullable().optional(),
    lastName: z.string(),
    suffix: z.string().nullable().optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Must be a valid E.164 phone number"),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format"),
    avatarUrl: z.string().url().nullable().optional(),
    cancelCount: z.number().int().nonnegative(),
    noShowCount: z.number().int().nonnegative(),
    rescheduleCount: z.number().int().nonnegative(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
);

export type PatientProfileForStaffDto = z.infer<typeof patientProfileForStaffSchema>;
