import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getInquiriesAction } from './get-inquiries.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockGetInquiriesQuery } = vi.hoisted(() => {
  return {
    mockGetInquiriesQuery: vi.fn(),
  };
});

vi.mock('../../repositories/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getInquiriesQuery: () => mockGetInquiriesQuery,
  };
});

describe('getInquiriesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return inquiries list for SECRETARY role', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'secretary-uuid',
      role: 'SECRETARY',
    } as any);

    vi.mocked(createClient).mockResolvedValue({} as any);
    
    const mockInquiries = [
      {
        id: 'inquiry-uuid',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        email: 'jane@example.com',
        preferredServiceId: 'service-uuid',
        preferredDate: '2026-06-25',
        status: 'NEW',
        createdAt: '2026-06-23T20:56:20Z',
        updatedAt: '2026-06-23T20:56:20Z',
      },
    ];
    mockGetInquiriesQuery.mockResolvedValueOnce(mockInquiries);

    const response = await getInquiriesAction();
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockInquiries);
  });

  it('should return inquiries list for ADMIN role', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'admin-uuid',
      role: 'ADMIN',
    } as any);

    vi.mocked(createClient).mockResolvedValue({} as any);
    mockGetInquiriesQuery.mockResolvedValueOnce([]);

    const response = await getInquiriesAction();
    expect(response.success).toBe(true);
    expect(response.data).toEqual([]);
  });

  it('should return unauthorized error for PATIENT role', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'patient-uuid',
      role: 'PATIENT',
    } as any);

    const response = await getInquiriesAction();
    expect(response.success).toBe(false);
    expect(response.error).toContain('Unauthorized');
  });
});
