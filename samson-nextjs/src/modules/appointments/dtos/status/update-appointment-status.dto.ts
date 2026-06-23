import { z } from 'zod';

const emptyStringToUndefined = z.literal('').transform(() => undefined);
const cleanOptionalString = z.string().trim().optional().transform(val => val === '' ? undefined : val);

export const appointmentStatusEnum = z.enum([
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'RESCHEDULE_REQUESTED',
    'DISPLACED',
    'CHECKED_IN',
    'TREATMENT_RENDERED',
    'COMPLETED',
    'NO_SHOW',
]);

export const staffUpdateAppointmentStatusSchema = z
    .object({
        appointmentId: z.string().uuid('Invalid Appointment ID format'),
        status: z.enum([
            'APPROVED',
            'REJECTED',
            'CANCELLED',
            'DISPLACED',
            'CHECKED_IN',
            'TREATMENT_RENDERED',
            'COMPLETED',
            'NO_SHOW',
        ]),
        statusReason: z.string().trim().min(1, 'Reason/Remark is required'),

        // Form Sanitized Reschedule Metadata
        newDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
            .or(emptyStringToUndefined)
            .optional(),
        newStartTime: z
            .string()
            .datetime('Must be a valid ISO string')
            .or(emptyStringToUndefined)
            .optional(),
        newEndTime: z
            .string()
            .datetime('Must be a valid ISO string')
            .or(emptyStringToUndefined)
            .optional(),
        newDoctorId: z
            .string()
            .uuid('Invalid Doctor ID format')
            .or(emptyStringToUndefined)
            .optional(),
    })
    .superRefine((data, ctx) => {
        // 1. Audit Trail Reasoning Guard - always required, handled by validation schema above.

        // 2. Cohesive Reschedule Block Validation
        const hasNewSchedule = !!(
            data.newDate ||
            data.newStartTime ||
            data.newEndTime ||
            data.newDoctorId
        );

        if (hasNewSchedule) {
            if (!data.newDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'New date is required for rescheduling',
                    path: ['newDate'],
                });
            }
            if (!data.newStartTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'New start time is required for rescheduling',
                    path: ['newStartTime'],
                });
            }
            if (!data.newEndTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'New end time is required for rescheduling',
                    path: ['newEndTime'],
                });
            }
            if (!data.newDoctorId) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Assigning a doctor is required for rescheduling',
                    path: ['newDoctorId'],
                });
            }

            // Chronological progression validation
            if (
                data.newStartTime &&
                data.newEndTime &&
                new Date(data.newStartTime) >= new Date(data.newEndTime)
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'New start time must be before end time',
                    path: ['newEndTime'],
                });
            }
        }
    });

export type StaffUpdateAppointmentStatusDto = z.infer<typeof staffUpdateAppointmentStatusSchema>;

