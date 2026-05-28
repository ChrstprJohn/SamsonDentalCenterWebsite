import { z } from 'zod';

export const doctorScheduleSchema = z
    .object({
        doctorId: z.string().uuid('Invalid doctor ID'),
        dayOfWeek: z.number().int().min(0).max(6, 'Day of week must be between 0 and 6'),
        startTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:MM required)'),
        endTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:MM required)'),
        breakStartTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format')
            .optional()
            .nullable(),
        breakEndTime: z
            .string()
            .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format')
            .optional()
            .nullable(),
    })
    .refine(
        (data) => {
            // Only add a basic refinement to ensure start time is before end time string-wise
            return data.startTime < data.endTime;
        },
        {
            message: 'End time must be after start time',
            path: ['endTime'],
        }
    );

export type DoctorScheduleDto = z.infer<typeof doctorScheduleSchema>;
