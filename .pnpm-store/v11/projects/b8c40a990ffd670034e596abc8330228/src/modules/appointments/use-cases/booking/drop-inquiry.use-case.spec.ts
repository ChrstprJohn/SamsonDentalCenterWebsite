import { describe, it, expect, vi } from 'vitest';
import { dropInquiryUseCase } from './drop-inquiry.use-case';

describe('dropInquiryUseCase', () => {
  it('should call dropInquiry dependency with inquiryId and secretaryNotes', async () => {
    const mockInquiryResponse = {
      id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '09123456789',
      email: 'jane.doe@example.com',
      preferredServiceId: 'uuid-service',
      preferredDate: '2026-06-25',
      status: 'DROPPED' as const,
      createdAt: '2026-06-22T04:00:00Z',
      updatedAt: '2026-06-22T04:05:00Z',
    };

    const mockDropInquiry = vi.fn().mockResolvedValue(mockInquiryResponse);
    const useCase = dropInquiryUseCase({ dropInquiry: mockDropInquiry });

    const input = {
      inquiryId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      secretaryNotes: 'Could not contact',
    };

    const result = await useCase(input);

    expect(mockDropInquiry).toHaveBeenCalledWith('da95a63c-333e-4b68-98e3-82bdf1a07bd5', 'Could not contact');
    expect(result).toEqual(mockInquiryResponse);
  });
});
