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
    // Dependent support
    dependentId: z.string().uuid('Invalid dependent ID format').nullable().optional(),
    newDependentFirstName: z.string().trim().min(1).optional(),
    newDependentMiddleName: cleanOptionalString,
    newDependentLastName: z.string().trim().min(1).optional(),
    newDependentSuffix: cleanOptionalString,
    newDependentDateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD')
      .optional(),
    newDependentRelationship: z
      .enum(['CHILD', 'SPOUSE', 'SIBLING', 'PARENT', 'OTHER'])
      .optional(),
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

    // 2. Guest mode: firstName, lastName, phoneNumber required
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

    // 3. New dependent: if first name provided, last name + DOB + relationship are required
    if (data.newDependentFirstName) {
      if (!data.newDependentLastName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Last name is required when adding a new dependent',
          path: ['newDependentLastName'],
        });
      }
      if (!data.newDependentDateOfBirth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Date of birth is required when adding a new dependent',
          path: ['newDependentDateOfBirth'],
        });
      }
      if (!data.newDependentRelationship) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Relationship is required when adding a new dependent',
          path: ['newDependentRelationship'],
        });
      }
    }
  });

export type CreateManualBookingDto = z.infer<typeof createManualBookingSchema>;
