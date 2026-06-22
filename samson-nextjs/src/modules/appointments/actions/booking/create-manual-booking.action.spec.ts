import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createManualBookingAction } from './create-manual-booking.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';

// 1. Hoist environment mocks to resolve server-only / Next.js dependency errors in Vitest
vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('next/server', () => ({
  after: vi.fn((fn) => fn()),
}));

const { mockCreateManualBooking, mockGetServiceDuration } = vi.hoisted(() => {
  return {
    mockCreateManualBooking: vi.fn(),
    mockGetServiceDuration: vi.fn(),
  };
});

vi.mock('../../repositories/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getServiceDurationQuery: () => mockGetServiceDuration,
    getDoctorSchedulesQuery: () => vi.fn(),
    getExistingAppointmentsQuery: () => vi.fn(),
  };
});

vi.mock('../../use-cases/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getAvailableTimeSlotsUseCase: () => vi.fn().mockResolvedValue({
      availableSlots: [{ startTime: '2026-06-25T10:00:00.000Z', endTime: '2026-06-25T10:30:00.000Z' }],
    }),
  };
});

vi.mock('../../use-cases/booking/create-manual-booking.use-case', () => {
  return {
    createManualBookingUseCase: () => mockCreateManualBooking,
  };
});

describe('createManualBookingAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    patientId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
    serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
    doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
    date: '2026-06-25',
    startTime: '2026-06-25T10:00:00.000Z',
    endTime: '2026-06-25T10:30:00.000Z',
    patientNote: 'Tooth pain',
    statusReason: 'Call coordinated',
  };

  it('should validate inputs, check user role, run use case and return success', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'secretary-uuid',
      role: 'SECRETARY',
    } as any);

    vi.mocked(createClient).mockResolvedValue({} as any);
    mockGetServiceDuration.mockResolvedValueOnce(30);
    mockCreateManualBooking.mockResolvedValueOnce({ appointmentId: 'app-uuid' });

    const response = await createManualBookingAction(validPayload);
    expect(response.success).toBe(true);
    expect(response.data?.appointmentId).toBe('app-uuid');
  });

  it('should return error for unauthorized patient roles', async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: 'patient-uuid',
      role: 'PATIENT',
    } as any);

    const response = await createManualBookingAction(validPayload);
    expect(response.success).toBe(false);
    expect(response.error).toContain('Unauthorized');
  });
});
