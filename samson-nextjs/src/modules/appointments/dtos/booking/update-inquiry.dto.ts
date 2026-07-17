import { z } from 'zod';

const cleanOptionalString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .optional();

export const updateInquirySchema = z.object({
  inquiryId: z.string().uuid('Invalid inquiry ID'),
  firstName: cleanOptionalString,
  middleName: cleanOptionalString,
  lastName: cleanOptionalString,
  suffix: cleanOptionalString,
  phoneNumber: cleanOptionalString,
  email: cleanOptionalString,
  patientNote: cleanOptionalString,
  serviceId: cleanOptionalString,
  date: cleanOptionalString,
  startTime: cleanOptionalString,
  assignedDoctorId: cleanOptionalString,
  assignedEndTime: cleanOptionalString,
});

export type UpdateInquiryDto = z.infer<typeof updateInquirySchema>;
