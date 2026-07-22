import { describe, it, expect } from 'vitest';
import { messageResponseSchema } from './message-response.dto';

describe('MessageResponseDto', () => {
    it('should transform database snake_case to application camelCase', () => {
        const dbPayload = {
            id: 'c2a71d23-28ad-4c81-8178-5e4c622a59a7',
            appointment_id: 'd3b82e34-39be-5d92-9289-6f5d733b6ab8',
            sender_role: 'PATIENT' as const,
            sender_name: 'John Doe',
            message: 'Hello World',
            created_at: '2026-07-13T12:00:00.000Z',
            is_read: false,
        };
        const result = messageResponseSchema.safeParse(dbPayload);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.appointmentId).toBe(dbPayload.appointment_id);
            expect(result.data.senderRole).toBe(dbPayload.sender_role);
            expect(result.data.isRead).toBe(dbPayload.is_read);
        }
    });
});
