import { z } from 'zod';
import { dependentRelationshipEnum } from '@/modules/patients/dtos/dependents/create-dependent.dto';

// Utility helper to intercept empty form fields and strip them down to undefined for Supabase NULL insertion
const emptyStringToUndefined = z.literal('').transform(() => undefined);
const cleanOptionalString = z.string().trim().optional().transform(val => val === '' ? undefined : val).optional();

export const submitBookingSchema = z
    .object({
        idempotencyKey: z.string().uuid('Idempotency key must be a valid UUID'),
        serviceId: z.string().uuid('Invalid Service ID format'),
        doctorId: z.string().uuid('Invalid Doctor ID format'), // Comes precisely from the availability slot data
        isPreferredDoctor: z.boolean().optional().default(false), // Optional tracking metric for database telemetry

        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        startTime: z.string().datetime('Must be a valid ISO string'),
        endTime: z.string().datetime('Must be a valid ISO string'),
        userNote: cleanOptionalString,

        patientType: z.enum(['SELF', 'EXISTING_DEPENDENT', 'NEW_DEPENDENT']),
        dependentId: z
            .string()
            .uuid('Invalid Dependent ID format')
            .optional()
            .or(emptyStringToUndefined)
            .optional(),

        // Required block options are trimmed first to secure against pure whitespace strings
        dependentFirstName: z.string().trim().optional(),
        dependentMiddleName: cleanOptionalString,
        dependentLastName: z.string().trim().optional(),
        dependentSuffix: cleanOptionalString,
        dependentBirthday: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
            .optional()
            .or(emptyStringToUndefined)
            .optional(),
        dependentRelationship: dependentRelationshipEnum.optional(),
    })
    .superRefine((data, ctx) => {
        // 1. Chronological Ordering Boundary Guard
        if (new Date(data.startTime) >= new Date(data.endTime)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Start time must be before end time',
                path: ['endTime'],
            });
        }

        // 2. Bound Family Verification Verification Rule
        if (data.patientType === 'EXISTING_DEPENDENT' && !data.dependentId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Dependent ID is required for existing dependents',
                path: ['dependentId'],
            });
        }

        // 3. Conditional Requirements Isolation Block for New Registrations
        if (data.patientType === 'NEW_DEPENDENT') {
            if (!data.dependentFirstName || data.dependentFirstName.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Dependent first name is required',
                    path: ['dependentFirstName'],
                });
            }
            if (!data.dependentLastName || data.dependentLastName.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Dependent last name is required',
                    path: ['dependentLastName'],
                });
            }
            if (!data.dependentRelationship || data.dependentRelationship.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Dependent relationship is required',
                    path: ['dependentRelationship'],
                });
            }
            if (!data.dependentBirthday) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Dependent birthday is required',
                    path: ['dependentBirthday'],
                });
            }
        }
    });

export type SubmitBookingDto = z.infer<typeof submitBookingSchema>;
