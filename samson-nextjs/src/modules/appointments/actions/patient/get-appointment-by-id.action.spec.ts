import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAppointmentByIdAction } from './get-appointment-by-id.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');

const { mockGetUseCase } = vi.hoisted(() => {
  return { mockGetUseCase: vi.fn() };
});

vi.mock('../../use-cases/patient/get-appointment-by-id.use-case', () => {
  return {
    getAppointmentByIdUseCase: () => mockGetUseCase,
  };
});

describe('getAppointmentByIdAction', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockSupabase = { from: vi.fn(() => ({ select: mockSelect })) } as any;
  const validUserId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd9';
  const validApptId = 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase);
  });

  it('returns appointment details when user owns it', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: validUserId } as any);
    mockGetUseCase.mockResolvedValue({
      id: validApptId,
      patientId: validUserId,
      status: 'APPROVED',
    });

    const result = await getAppointmentByIdAction(validApptId);

    expect(result).toEqual({
      success: true,
      data: {
        id: validApptId,
        patientId: validUserId,
        status: 'APPROVED',
      },
    });
    expect(mockGetUseCase).toHaveBeenCalledWith(validApptId);
  });

  it('returns error if user does not own the appointment', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: validUserId } as any);
    mockGetUseCase.mockResolvedValue({
      id: validApptId,
      patientId: 'another-user-id',
      status: 'APPROVED',
    });

    const result = await getAppointmentByIdAction(validApptId);

    expect(result.success).toBe(false);
    expect(result.error).toContain('not authorized to view');
  });

  it('returns validation error for invalid UUID parameter', async () => {
    const result = await getAppointmentByIdAction('invalid-uuid');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
  });
});
