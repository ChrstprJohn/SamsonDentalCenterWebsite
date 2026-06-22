import { describe, it, expect, vi } from 'vitest';
import { createInquiryCommand } from './appointment-inquiries.commands';
import { SupabaseClient } from '@supabase/supabase-js';

describe('createInquiryCommand', () => {
  it('should successfully execute query and return camelCased inquiry DTO', async () => {
    const mockDbRecord = {
      id: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '+639171234567',
      email: 'john@example.com',
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

    const mockSupabase = { from: mockFrom } as unknown as SupabaseClient;

    const command = createInquiryCommand(mockSupabase);
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+639171234567',
      email: 'john@example.com',
      preferredServiceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      preferredDate: '2026-06-25',
    };

    const result = await command(payload);
    expect(mockFrom).toHaveBeenCalledWith('appointment_inquiries');
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+639171234567',
      }),
    ]);
    expect(result.firstName).toBe('John');
    expect(result.status).toBe('NEW');
  });
});
