import { z } from 'zod';

export const createCoordinationLogSchema = z
  .object({
    inquiryId: z.string().uuid('Invalid inquiry ID').optional().nullable(),
    appointmentId: z.string().uuid('Invalid appointment ID').optional().nullable(),
    actionType: z.enum([
      'SCHEDULE_CONFLICT',
      'OUTSIDE_HOURS',
      'DR_UNAVAILABLE',
      'WAITING_ON_DOCTOR',
      'NEEDS_RESCHEDULE',
      'CALLED_NO_ANSWER',
      'LEFT_VOICEMAIL',
      'LINE_BUSY_DROPPED',
      'SMS_SENT',
      'SMS_CONFIRMED',
      'EMAIL_SENT',
      'PATIENT_EMAILED_BACK',
      'CUSTOM_NOTE',
    ]),
    message: z.string().trim().min(1, 'Message is required').max(500, 'Message too long'),
  })
  .refine((data) => Boolean(data.inquiryId || data.appointmentId), {
    message: 'Either inquiryId or appointmentId must be provided',
  });

export type CreateCoordinationLogDto = z.infer<typeof createCoordinationLogSchema>;
