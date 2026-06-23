import { z } from 'zod';

const cleanOptionalString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .optional();

// 1. Input Validation Schema
export const submitInquirySchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  middleName: cleanOptionalString,
  lastName: z.string().trim().min(1, 'Last name is required'),
  suffix: cleanOptionalString,
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164 expected)'),
  email: z.string().trim().email('Invalid email address'),
  preferredServiceId: z.string().uuid('Invalid service format'),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  patientNote: cleanOptionalString,
});

export type SubmitInquiryDto = z.infer<typeof submitInquirySchema>;

// 2. Output Database schema mapping
const inquiryDbSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  middle_name: z.string().nullable().optional(),
  last_name: z.string(),
  suffix: z.string().nullable().optional(),
  phone_number: z.string(),
  email: z.string(),
  preferred_service_id: z.string().uuid(),
  preferred_date: z.string(),
  patient_note: z.string().nullable().optional(),
  status: z.enum(['NEW', 'CONVERTED', 'DROPPED']),
  linked_appointment_id: z.string().uuid().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  services: z
    .object({
      name: z.string(),
    })
    .nullable()
    .optional(),
});

// Transform DB shape (snake_case) to App shape (camelCase)
export const inquiryResponseSchema = inquiryDbSchema.transform((data) => ({
  id: data.id,
  firstName: data.first_name,
  middleName: data.middle_name ?? undefined,
  lastName: data.last_name,
  suffix: data.suffix ?? undefined,
  phoneNumber: data.phone_number,
  email: data.email,
  preferredServiceId: data.preferred_service_id,
  preferredServiceName: data.services?.name ?? 'Unknown Service',
  preferredDate: data.preferred_date,
  patientNote: data.patient_note ?? undefined,
  status: data.status,
  linkedAppointmentId: data.linked_appointment_id ?? undefined,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
}));

export type InquiryResponseDto = z.infer<typeof inquiryResponseSchema>;
