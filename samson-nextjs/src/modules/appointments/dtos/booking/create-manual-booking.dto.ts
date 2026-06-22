import { z } from 'zod';

const cleanOptionalString = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .optional();

const emailOrEmpty = z
  .string()
  .trim()
  .transform((val) => (val === '' ? undefined : val))
  .optional()
  .refine((val) => !val || z.string().email().safeParse(val).success, {
    message: 'Invalid email address',
  });

export const createManualBookingSchema = z
  .object({
    patientId: z.string().uuid('Invalid patient ID format').nullable().optional(),
    firstName: z.string().trim().optional(),
    middleName: cleanOptionalString,
    lastName: z.string().trim().optional(),
    suffix: cleanOptionalString,
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
        message: 'Invalid phone number format (E.164 expected)',
      }),
    email: emailOrEmpty,
    serviceId: z.string().uuid('Invalid service ID format'),
    doctorId: z.string().uuid('Invalid doctor ID format'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().datetime('Must be a valid ISO string'),
    endTime: z.string().datetime('Must be a valid ISO string'),
    patientNote: cleanOptionalString,
    statusReason: cleanOptionalString,
  })
  .superRefine((data, ctx) => {
    // 1. Start time must be before end time
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start time must be before end time',
        path: ['endTime'],
      });
    }

    // 2. If patientId is null/undefined, it is Guest Mode. Guest fields are required.
    if (!data.patientId) {
      if (!data.firstName || data.firstName.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'First name is required for guests',
          path: ['firstName'],
        });
      }
      if (!data.lastName || data.lastName.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last name is required for guests',
          path: ['lastName'],
        });
      }
      if (!data.phoneNumber || data.phoneNumber.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone number is required for guests',
          path: ['phoneNumber'],
        });
      }
    }
  });

export type CreateManualBookingDto = z.infer<typeof createManualBookingSchema>;
