import { describe, it, expect, vi } from 'vitest';
import { markMessagesAsReadUseCase } from './mark-messages-as-read.use-case';

describe('MarkMessagesAsReadUseCase', () => {
    it('should mark PATIENT messages as read when reader is STAFF', async () => {
        const mockMark = vi.fn().mockResolvedValue(undefined);
        const useCase = markMessagesAsReadUseCase(mockMark);

        await useCase('appt-123', 'STAFF');
        expect(mockMark).toHaveBeenCalledWith('appt-123', 'PATIENT');
    });

    it('should mark STAFF messages as read when reader is PATIENT', async () => {
        const mockMark = vi.fn().mockResolvedValue(undefined);
        const useCase = markMessagesAsReadUseCase(mockMark);

        await useCase('appt-123', 'PATIENT');
        expect(mockMark).toHaveBeenCalledWith('appt-123', 'STAFF');
    });
});
