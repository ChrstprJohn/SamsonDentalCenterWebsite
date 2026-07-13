import { z } from 'zod';

export const sendMessageSchema = z.object({
    appointmentId: z.string().uuid('Invalid Appointment ID format'),
    message: z.string().min(1, 'Message content cannot be empty'),
    senderRole: z.enum(['PATIENT', 'STAFF']),
    senderName: z.string().min(1, 'Sender name is required'),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
