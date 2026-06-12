import { z } from 'zod';

export const doctorScheduleDbSchema = z.object({
  id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  break_start_time: z.string().nullable().optional(),
  break_end_time: z.string().nullable().optional(),
});

export const doctorScheduleResponseSchema = doctorScheduleDbSchema.transform((data) => ({
  id: data.id,
  doctorId: data.doctor_id,
  dayOfWeek: data.day_of_week,
  startTime: data.start_time,
  endTime: data.end_time,
  breakStartTime: data.break_start_time,
  breakEndTime: data.break_end_time,
}));

export type DoctorScheduleResponseDto = z.infer<typeof doctorScheduleResponseSchema>;
