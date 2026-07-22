import { describe, it, expect } from 'vitest';
import { sendMessageSchema } from './send-message.dto';

describe('SendMessageDto', () => {
    it('should validate a valid payload', () => {
        const payload = {
            appointmentId: 'c2a71d23-28ad-4c81-8178-5e4c622a59a7',
            message: 'Hello Secretary',
            senderRole: 'PATIENT',
            senderName: 'John Doe',
        };
        const result = sendMessageSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('should fail validation with empty message', () => {
        const payload = {
            appointmentId: 'c2a71d23-28ad-4c81-8178-5e4c622a59a7',
            message: '',
            senderRole: 'PATIENT',
            senderName: 'John Doe',
        };
        const result = sendMessageSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });
});
