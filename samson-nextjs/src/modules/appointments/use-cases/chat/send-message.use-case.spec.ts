import { describe, it, expect, vi } from 'vitest';
import { sendMessageUseCase } from './send-message.use-case';

describe('SendMessageUseCase', () => {
    it('should throw an error if the appointment status is not active', async () => {
        const mockGetStatus = vi.fn().mockResolvedValue({ status: 'COMPLETED', patientId: 'patient-1' });
        const mockInsert = vi.fn();

        const useCase = sendMessageUseCase(mockGetStatus, mockInsert);
        await expect(
            useCase({
                appointmentId: 'appt-123',
                senderRole: 'PATIENT',
                senderName: 'John',
                message: 'Hi',
            })
        ).rejects.toThrow('This chat thread is not active because the appointment is COMPLETED.');

        expect(mockInsert).not.toHaveBeenCalled();
    });

    it('should succeed and insert message if appointment is APPROVED', async () => {
        const mockGetStatus = vi.fn().mockResolvedValue({ status: 'APPROVED', patientId: 'patient-1' });
        const mockInsert = vi.fn().mockResolvedValue({ id: 'msg-1' });

        const useCase = sendMessageUseCase(mockGetStatus, mockInsert);
        const result = await useCase({
            appointmentId: 'appt-123',
            senderRole: 'PATIENT',
            senderName: 'John',
            message: 'Hi',
        });

        expect(result.id).toBe('msg-1');
        expect(mockInsert).toHaveBeenCalled();
    });
});
