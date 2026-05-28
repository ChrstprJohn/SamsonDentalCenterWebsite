import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;
const timeStringSchema = z.string().regex(timeRegex, 'Invalid time format (HH:MM required)');

export const DayOfWeekEnum = z.enum([
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
]);

// Optional helper to keep your DTO and DB logic synced
export const DayOfWeekMap: Record<z.infer<typeof DayOfWeekEnum>, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

export const doctorScheduleSchema = z
    .object({
        doctorId: z.string().uuid('Invalid doctor ID'),
        dayOfWeek: DayOfWeekEnum,
        startTime: timeStringSchema,
        endTime: timeStringSchema,
        breakStartTime: timeStringSchema.optional().nullable(),
        breakEndTime: timeStringSchema.optional().nullable(),
    })
    .refine(
        (data) => {
            return data.startTime < data.endTime;
        },
        {
            message: 'End time must be after start time',
            path: ['endTime'],
        }
    )
    .refine(
        (data) => {
            if (!data.breakStartTime || !data.breakEndTime) return true;
            return data.breakStartTime < data.breakEndTime;
        },
        {
            message: 'Break end time must be after break start time',
            path: ['breakEndTime'],
        }
    )
    .refine(
        (data) => {
            if (!data.breakStartTime || !data.breakEndTime) return true;
            return data.breakStartTime >= data.startTime && data.breakEndTime <= data.endTime;
        },
        {
            message: 'Break must be entirely within the working hours',
            path: ['breakStartTime'],
        }
    );

export type DoctorScheduleDto = z.infer<typeof doctorScheduleSchema>;
