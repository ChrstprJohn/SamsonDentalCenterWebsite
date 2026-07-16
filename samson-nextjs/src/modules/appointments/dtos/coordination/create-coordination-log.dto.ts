import { z } from 'zod';

export const createCoordinationLogSchema = z.object({
  inquiryId: z.string().uuid('Invalid inquiry ID'),
  actionType: z.enum([
    'SCHEDULE_CONFLICT',
    'NEEDS_RESCHEDULE',
    'WAITING_ON_DOCTOR',
    'CALLED_NO_ANSWER',
    'LEFT_VOICEMAIL',
    'SMS_SENT',
    'EMAIL_SENT',
    'CUSTOM_NOTE',
  ]),
  message: z.string().trim().min(1, 'Message is required').max(500, 'Message too long'),
});

export type CreateCoordinationLogDto = z.infer<typeof createCoordinationLogSchema>;
