import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dropInquiryAction } from './drop-inquiry.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockDropInquiry } = vi.hoisted(() => {
  return {
    mockDropInquiry: vi.fn(),
  };
});

vi.mock('../../use-cases/booking/drop-inquiry.use-case', () => {
  return {
    dropInquiryUseCase: () => mockDropInquiry,
  };
});

describe('dropInquiryAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate inputs, check user role, run use case and return success', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'secretary-uuid',
      role: 'SECRETARY',
    } as any);

    vi.mocked(createClient).mockResolvedValue({} as any);
    mockDropInquiry.mockResolvedValueOnce({
      id: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      status: 'DROPPED',
    });

    const payload = {
      inquiryId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      secretaryNotes: 'Wrong number',
    };

    const response = await dropInquiryAction(payload);
    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('DROPPED');
  });

  it('should return error for unauthorized patient roles', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'patient-uuid',
      role: 'PATIENT',
    } as any);

    const payload = {
      inquiryId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      secretaryNotes: 'Incorrect phone',
    };

    const response = await dropInquiryAction(payload);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Unauthorized');
  });
});
