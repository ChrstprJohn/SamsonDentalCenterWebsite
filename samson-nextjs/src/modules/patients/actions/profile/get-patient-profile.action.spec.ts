import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientProfileAction } from './get-patient-profile.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { NotFoundError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockExecute } = vi.hoisted(() => {
  return { mockExecute: vi.fn() };
});

vi.mock('../../use-cases/profile/get-patient-profile.use-case', () => {
  return {
    getPatientProfileUseCase: () => mockExecute,
  };
});

describe('getPatientProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });



  it('successfully fetches patient profile for authenticated user', async () => {
    const mockUser = { id: 'patient_123' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser as any);
    vi.mocked(createClient).mockResolvedValue({} as any);

    mockExecute.mockResolvedValue({
      id: 'patient_123',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    const result = await getPatientProfileAction();

    expect(result).toEqual({
      success: true,
      data: {
        id: 'patient_123',
        firstName: 'Jane',
        lastName: 'Doe',
      },
    });
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalledWith('patient_123');
  });

  it('returns structured error if profile is not found', async () => {
    const mockUser = { id: 'patient_unknown' };
    vi.mocked(getAuthenticatedUser).mockResolvedValue(mockUser as any);
    vi.mocked(createClient).mockResolvedValue({} as any);

    mockExecute.mockRejectedValue(new NotFoundError('Patient profile not found.'));

    const result = await getPatientProfileAction();

    expect(result).toEqual({
      success: false,
      error: 'Patient profile not found.',
    });
  });
});
