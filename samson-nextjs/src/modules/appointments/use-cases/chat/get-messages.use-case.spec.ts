import { describe, it, expect, vi } from 'vitest';
import { getMessagesUseCase } from './get-messages.use-case';

describe('GetMessagesUseCase', () => {
    it('should throw error if user is not authorized', async () => {
        const mockGetStatus = vi.fn().mockResolvedValue({ status: 'APPROVED', patientId: 'owner-id' });
        const mockGetMessages = vi.fn();

        const useCase = getMessagesUseCase(mockGetStatus, mockGetMessages);
        await expect(
            useCase('appt-123', { id: 'other-user', role: 'PATIENT' })
        ).rejects.toThrow('Unauthorized to view this chat thread');

        expect(mockGetMessages).not.toHaveBeenCalled();
    });

    it('should succeed if user is staff', async () => {
        const mockGetStatus = vi.fn().mockResolvedValue({ status: 'APPROVED', patientId: 'owner-id' });
        const mockGetMessages = vi.fn().mockResolvedValue({ messages: [{ id: 'msg-1' }], hasMore: false });

        const useCase = getMessagesUseCase(mockGetStatus, mockGetMessages);
        const result = await useCase('appt-123', { id: 'staff-id', role: 'SECRETARY' });

        expect(result.messages).toHaveLength(1);
        expect(mockGetMessages).toHaveBeenCalled();
    });
});
