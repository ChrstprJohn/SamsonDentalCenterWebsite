import { z } from 'zod';

const cleanOptionalString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .optional();

// 1. Input validation schema for conversion panel
export const convertInquirySchema = z
  .object({
    inquiryId: z.string().uuid('Invalid inquiry ID format'),
    serviceId: z.string().uuid('Invalid service ID format'),
    doctorId: z.string().uuid('Invalid doctor ID format'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().datetime('Must be a valid ISO string'),
    endTime: z.string().datetime('Must be a valid ISO string'),
    patientNote: cleanOptionalString, // editable draft
    secretaryNotes: cleanOptionalString, // call notes
    linkedPatientId: z.string().uuid('Invalid patient ID format').optional(),
    guestFirstName: cleanOptionalString,
    guestMiddleName: cleanOptionalString,
    guestLastName: cleanOptionalString,
    guestSuffix: cleanOptionalString,
    guestPhone: cleanOptionalString,
    guestEmail: cleanOptionalString,
  })
  .superRefine((data, ctx) => {
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start time must be before end time',
        path: ['endTime'],
      });
    }
  });

export type ConvertInquiryDto = z.infer<typeof convertInquirySchema>;
