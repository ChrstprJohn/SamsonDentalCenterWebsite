import { z } from 'zod';

export const sendMessageSchema = z.object({
    appointmentId: z.string().uuid('Invalid Appointment ID format'),
    message: z.string().trim().min(1, 'Message content cannot be empty').max(4000, 'Message content is too long'),
    senderRole: z.enum(['PATIENT', 'STAFF']),
    senderName: z.string().trim().min(1, 'Sender name is required').max(120, 'Sender name is too long'),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
