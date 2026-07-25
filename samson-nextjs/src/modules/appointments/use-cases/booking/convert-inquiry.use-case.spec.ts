import { describe, it, expect, vi } from 'vitest';
import { convertInquiryUseCase } from './convert-inquiry.use-case';

describe('convertInquiryUseCase', () => {
  it('should convert successfully bypassing availability slot verification', async () => {
    const mockExecuteConversionTransaction = vi.fn().mockResolvedValue({ appointmentId: 'app-123' });

    const useCase = convertInquiryUseCase({
      executeConversionTransaction: mockExecuteConversionTransaction,
    });

    const payload = {
      inquiryId: 'inq-123',
      serviceId: 'srv-123',
      doctorId: 'doc-123',
      doctorAssignmentSource: 'SYSTEM' as const,
      confirmationChannel: 'EMAIL' as const,
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
    };

    const result = await useCase(payload, 'secretary-123');
    expect(mockExecuteConversionTransaction).toHaveBeenCalledWith(payload, 'secretary-123');
    expect(result.appointmentId).toBe('app-123');
  });
});
