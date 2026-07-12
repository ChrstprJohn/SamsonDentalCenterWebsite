import { describe, it, expect, vi } from 'vitest';
import { submitInquiryUseCase } from './submit-inquiry.use-case';

describe('submitInquiryUseCase', () => {
  it('should call createInquiry dependency and return the DTO', async () => {
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
      preferredStartTime: '09:00',
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
      preferredStartTime: '09:00',
    };

    const result = await useCase(payload);
    expect(mockCreateInquiry).toHaveBeenCalledWith(payload);
    expect(result.firstName).toBe('Jane');
    expect(result.status).toBe('NEW');
    expect(result.preferredStartTime).toBe('09:00');
  });

  it('should pass preferredStartTime through correctly', async () => {
    const mockCreatedInquiry = {
      id: 'eeeeeeee-d113-4ec2-a5e6-ec083b0f5cc5',
      firstName: 'Ana',
      lastName: 'Cruz',
      phoneNumber: '+639181234567',
      email: 'ana@example.com',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-07-10',
      status: 'NEW' as const,
      createdAt: '2026-07-10T04:00:00Z',
      updatedAt: '2026-07-10T04:00:00Z',
      preferredStartTime: '14:00',
      dateOfBirth: '1990-05-15',
    };

    const mockCreateInquiry = vi.fn().mockResolvedValue(mockCreatedInquiry);
    const useCase = submitInquiryUseCase({ createInquiry: mockCreateInquiry });

    const payload = {
      firstName: 'Ana',
      lastName: 'Cruz',
      phoneNumber: '+639181234567',
      email: 'ana@example.com',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-07-10',
      preferredStartTime: '14:00',
      dateOfBirth: '1990-05-15',
    };

    const result = await useCase(payload);
    expect(mockCreateInquiry).toHaveBeenCalledWith(payload);
    expect(result.preferredStartTime).toBe('14:00');
    expect(result.dateOfBirth).toBe('1990-05-15');
  });
});
