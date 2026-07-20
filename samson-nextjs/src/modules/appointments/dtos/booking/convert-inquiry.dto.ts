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
    doctorId: z.string().uuid('Invalid doctor ID format').nullable().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format (e.g. 09:00)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format (e.g. 09:25)'),
    patientNote: cleanOptionalString, // editable draft
    secretaryNotes: cleanOptionalString, // call notes
    linkedPatientId: z.string().uuid('Invalid patient ID format').optional(),
    guestFirstName: cleanOptionalString,
    guestMiddleName: cleanOptionalString,
    guestLastName: cleanOptionalString,
    guestSuffix: cleanOptionalString,
    guestPhone: cleanOptionalString,
    guestEmail: cleanOptionalString,
    doctorAssignmentSource: z.enum(['SYSTEM', 'USER']).optional().default('SYSTEM'),
  })
  .superRefine((data, ctx) => {
    // Chronological guard — HH:MM strings compare correctly lexicographically
    if (data.startTime >= data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start time must be before end time',
        path: ['endTime'],
      });
    }
  });

export type ConvertInquiryDto = z.infer<typeof convertInquirySchema>;
