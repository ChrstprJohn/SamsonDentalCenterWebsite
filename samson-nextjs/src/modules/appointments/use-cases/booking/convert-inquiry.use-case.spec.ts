import { describe, it, expect, vi } from 'vitest';
import { convertInquiryUseCase } from './convert-inquiry.use-case';
import { ValidationError } from '@/shared/errors';

describe('convertInquiryUseCase', () => {
  it('should convert successfully when slot is available', async () => {
    const mockGetAvailableTimeSlots = vi.fn().mockResolvedValue({
      availableSlots: [{ startTime: '2026-06-25T10:00:00Z', endTime: '2026-06-25T10:30:00Z' }],
    });
    const mockExecuteConversionTransaction = vi.fn().mockResolvedValue({ appointmentId: 'app-123' });

    const useCase = convertInquiryUseCase({
      executeConversionTransaction: mockExecuteConversionTransaction,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    const payload = {
      inquiryId: 'inq-123',
      serviceId: 'srv-123',
      doctorId: 'doc-123',
      doctorAssignmentSource: 'SYSTEM' as const,
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
    };

    const result = await useCase(payload, 'secretary-123');
    expect(mockGetAvailableTimeSlots).toHaveBeenCalledWith({ serviceId: 'srv-123', doctorId: 'doc-123', date: '2026-06-25' });
    expect(mockExecuteConversionTransaction).toHaveBeenCalledWith(payload, 'secretary-123');
    expect(result.appointmentId).toBe('app-123');
  });

  it('should throw validation error when slot is unavailable', async () => {
    const mockGetAvailableTimeSlots = vi.fn().mockResolvedValue({ availableSlots: [] });
    const mockExecuteConversionTransaction = vi.fn();

    const useCase = convertInquiryUseCase({
      executeConversionTransaction: mockExecuteConversionTransaction,
      getAvailableTimeSlots: mockGetAvailableTimeSlots,
    });

    const payload = {
      inquiryId: 'inq-123',
      serviceId: 'srv-123',
      doctorId: 'doc-123',
      doctorAssignmentSource: 'SYSTEM' as const,
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
    };

    await expect(useCase(payload, 'secretary-123')).rejects.toThrow(ValidationError);
    expect(mockExecuteConversionTransaction).not.toHaveBeenCalled();
  });
});
