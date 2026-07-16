import { z } from 'zod';

const coordinationLogDbSchema = z.object({
  id: z.string().uuid(),
  inquiry_id: z.string().uuid(),
  action_type: z.string(),
  message: z.string(),
  created_at: z.string(),
  created_by: z.string().uuid().nullable(),
});

export const coordinationLogResponseSchema = coordinationLogDbSchema.transform((data) => ({
  id: data.id,
  inquiryId: data.inquiry_id,
  actionType: data.action_type as CreateCoordinationLogActionType,
  message: data.message,
  createdAt: data.created_at,
  createdBy: data.created_by ?? undefined,
}));

export type CoordinationLogResponseDto = z.infer<typeof coordinationLogResponseSchema>;

export type CreateCoordinationLogActionType =
  | 'SCHEDULE_CONFLICT'
  | 'NEEDS_RESCHEDULE'
  | 'WAITING_ON_DOCTOR'
  | 'CALLED_NO_ANSWER'
  | 'LEFT_VOICEMAIL'
  | 'SMS_SENT'
  | 'EMAIL_SENT'
  | 'CUSTOM_NOTE';
