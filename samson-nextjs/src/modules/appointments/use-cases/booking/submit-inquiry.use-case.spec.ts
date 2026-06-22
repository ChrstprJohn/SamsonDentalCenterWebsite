import { describe, it, expect, vi } from 'vitest';
import { submitInquiryUseCase } from './submit-inquiry.use-case';

describe('submitInquiryUseCase', () => {
  it('should call dependency and return transformed DTO', async () => {
    const mockCreatedInquiry = {
      id: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+639171234567',
      email: 'jane@example.com',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-06-25',
      status: 'NEW' as const,
      createdAt: '2026-06-22T04:00:00Z',
      updatedAt: '2026-06-22T04:00:00Z',
    };

    const mockCreateInquiry = vi.fn().mockResolvedValue(mockCreatedInquiry);
    const useCase = submitInquiryUseCase({ createInquiry: mockCreateInquiry });

    const payload = {
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+639171234567',
      email: 'jane@example.com',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-06-25',
    };

    const result = await useCase(payload);
    expect(mockCreateInquiry).toHaveBeenCalledWith(payload);
    expect(result.firstName).toBe('Jane');
    expect(result.status).toBe('NEW');
  });
});
