import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPatientsAction } from './search-patients.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockSearchPatients } = vi.hoisted(() => {
  return {
    mockSearchPatients: vi.fn(),
  };
});

vi.mock('../../repositories/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    searchPatientsQuery: () => mockSearchPatients,
  };
});

describe('searchPatientsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate search, check auth role, and return results', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'secretary-uuid',
      role: 'SECRETARY',
    } as any);

    vi.mocked(createClient).mockResolvedValue({} as any);

    const mockPatients = [
      {
        id: 'patient-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1234567890',
        dateOfBirth: '1990-01-01',
      },
    ];

    mockSearchPatients.mockResolvedValueOnce(mockPatients);

    const response = await searchPatientsAction({ query: 'john' });
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockPatients);
  });

  it('should return error for query length < 2', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'secretary-uuid',
      role: 'SECRETARY',
    } as any);

    const response = await searchPatientsAction({ query: 'a' });
    expect(response.success).toBe(false);
    expect(response.error).toContain('Validation failed');
  });

  it('should return error for unauthorized patient roles', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'patient-uuid',
      role: 'PATIENT',
    } as any);

    const response = await searchPatientsAction({ query: 'john' });
    expect(response.success).toBe(false);
    expect(response.error).toContain('Unauthorized');
  });
});
