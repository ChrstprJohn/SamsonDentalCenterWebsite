import { z } from 'zod';

const messageDbSchema = z.object({
    id: z.string().uuid(),
    appointment_id: z.string().uuid(),
    sender_role: z.enum(['PATIENT', 'STAFF']),
    sender_name: z.string(),
    message: z.string(),
    created_at: z.string().or(z.date()),
    is_read: z.boolean(),
});

export const messageResponseSchema = messageDbSchema.transform((data) => ({
    id: data.id,
    appointmentId: data.appointment_id,
    senderRole: data.sender_role,
    senderName: data.sender_name,
    message: data.message,
    createdAt: typeof data.created_at === 'string' ? data.created_at : data.created_at.toISOString(),
    isRead: data.is_read,
}));

export type MessageResponseDto = z.infer<typeof messageResponseSchema>;
