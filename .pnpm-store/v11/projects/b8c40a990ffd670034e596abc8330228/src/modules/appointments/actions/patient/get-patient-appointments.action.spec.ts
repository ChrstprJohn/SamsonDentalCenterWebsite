import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPatientAppointmentsAction } from './get-patient-appointments.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockExecute } = vi.hoisted(() => {
  return { mockExecute: vi.fn() };
});

vi.mock('../../use-cases/patient/get-patient-appointments.use-case', () => {
  return {
    getPatientAppointmentsUseCase: () => mockExecute,
    GetPatientAppointmentsUseCase: class {
      execute = mockExecute;
    },
  };
});

describe('getPatientAppointmentsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully retrieves current patient appointments', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user_123' } as any);
    vi.mocked(createClient).mockResolvedValue({} as any);
    mockExecute.mockResolvedValue([{ id: 'appt_1' }]);

    const result = await getPatientAppointmentsAction();

    expect(result).toEqual({ success: true, data: [{ id: 'appt_1' }] });
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalledWith('user_123');
  });
});
