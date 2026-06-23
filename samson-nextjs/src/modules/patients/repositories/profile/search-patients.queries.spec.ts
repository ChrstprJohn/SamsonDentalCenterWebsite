import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { searchPatientsQuery } from './search-patients.queries';

describe('searchPatientsQuery', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: [], error: null })),
    };
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockReturnValue(mockSupabase);
  });

  it('should query patients matching email, first_name, or last_name', async () => {
    const mockDbRow = {
      id: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      first_name: 'John',
      middle_name: null,
      last_name: 'Doe',
      suffix: null,
      phone_number: '+1234567890',
      email: 'john.doe@example.com',
      date_of_birth: '1990-01-01',
      avatar_url: null,
      created_at: '2026-06-23T20:56:20Z',
      updated_at: '2026-06-23T20:56:20Z',
    };

    mockSupabase.then = vi.fn((resolve) => resolve({ data: [mockDbRow], error: null }));

    const query = searchPatientsQuery(mockSupabase as unknown as SupabaseClient);
    const result = await query({ query: 'john' });

    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockSupabase.eq).toHaveBeenCalledWith('role', 'PATIENT');
    expect(mockSupabase.or).toHaveBeenCalledWith('email.ilike.%john%,first_name.ilike.%john%,last_name.ilike.%john%');
    expect(mockSupabase.limit).toHaveBeenCalledWith(10);
    expect(result).toEqual([
      {
        id: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
        firstName: 'John',
        middleName: null,
        lastName: 'Doe',
        suffix: null,
        phoneNumber: '+1234567890',
        email: 'john.doe@example.com',
        dateOfBirth: '1990-01-01',
        avatarUrl: null,
        createdAt: '2026-06-23T20:56:20Z',
        updatedAt: '2026-06-23T20:56:20Z',
      },
    ]);
  });
});
