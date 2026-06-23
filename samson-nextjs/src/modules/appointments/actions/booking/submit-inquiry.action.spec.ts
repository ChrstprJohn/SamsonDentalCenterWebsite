import { describe, it, expect, vi } from 'vitest';
import { submitInquiryAction } from './submit-inquiry.action';
import * as dbModule from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
  createAdminClient: vi.fn(),
}));

describe('submitInquiryAction', () => {
  it('should validate inputs, run use case and return success object', async () => {
    const mockDbRecord = {
      id: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      first_name: 'Jane',
      last_name: 'Doe',
      phone_number: '+639171234567',
      email: 'jane@example.com',
      preferred_service_id: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferred_date: '2026-06-25',
      status: 'NEW',
      created_at: '2026-06-22T04:00:00Z',
      updated_at: '2026-06-22T04:00:00Z',
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: mockDbRecord, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

    const mockSupabase = { from: mockFrom };
    vi.spyOn(dbModule, 'createAdminClient').mockResolvedValue(mockSupabase as any);

    const payload = {
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '+639171234567',
      email: 'jane@example.com',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-06-25',
    };

    const response = await submitInquiryAction(payload);
    expect(response.success).toBe(true);
    expect(response.data?.firstName).toBe('Jane');
  });
});
