import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getInquiriesQuery } from './appointment-inquiries.queries';

describe('getInquiriesQuery', () => {
  let mockSupabase: any;
  const inquiryId = 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5';
  const serviceId = 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null }))
    };
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
  });

  it('should fetch inquiries in NEW status ordered by created_at DESC', async () => {
    const mockDbRow = {
      id: inquiryId,
      first_name: 'John',
      middle_name: null,
      last_name: 'Doe',
      suffix: null,
      phone_number: '+1234567890',
      email: 'john.doe@example.com',
      preferred_service_id: serviceId,
      preferred_date: '2026-06-25',
      patient_note: 'Tooth hurts',
      status: 'NEW',
      linked_appointment_id: null,
      created_at: '2026-06-23T20:56:20Z',
      updated_at: '2026-06-23T20:56:20Z',
      services: { name: 'Root Canal' },
    };

    mockSupabase.then = vi.fn((resolve) => resolve({ data: [mockDbRow], error: null }));

    const query = getInquiriesQuery(mockSupabase as unknown as SupabaseClient);
    const result = await query();

    expect(mockSupabase.from).toHaveBeenCalledWith('appointment_inquiries');
    expect(mockSupabase.select).toHaveBeenCalledWith('*, services:preferred_service_id(name)');
    expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'NEW');
    expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual([
      {
        id: inquiryId,
        firstName: 'John',
        middleName: undefined,
        lastName: 'Doe',
        suffix: undefined,
        phoneNumber: '+1234567890',
        email: 'john.doe@example.com',
        preferredServiceId: serviceId,
        preferredServiceName: 'Root Canal',
        preferredDate: '2026-06-25',
        patientNote: 'Tooth hurts',
        status: 'NEW',
        linkedAppointmentId: undefined,
        createdAt: '2026-06-23T20:56:20Z',
        updatedAt: '2026-06-23T20:56:20Z',
      },
    ]);
  });

  it('should throw DomainError on database error', async () => {
    mockSupabase.then = vi.fn((resolve) =>
      resolve({ data: null, error: { message: 'Database query failed' } })
    );

    const query = getInquiriesQuery(mockSupabase as unknown as SupabaseClient);
    await expect(query()).rejects.toThrow('Failed to fetch appointment inquiries: Database query failed');
  });
});
