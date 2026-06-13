import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableTimeSlotsAction } from './get-available-time-slots.action';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/server');

const { mockGetAvailableTimeSlotsUseCase, mockGetServiceDuration } = vi.hoisted(() => {
  return {
    mockGetAvailableTimeSlotsUseCase: vi.fn(),
    mockGetServiceDuration: vi.fn(),
  };
});

vi.mock('../../use-cases/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getAvailableTimeSlotsUseCase: () => mockGetAvailableTimeSlotsUseCase,
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

describe('getAvailableTimeSlotsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully validates inputs and executes getAvailableTimeSlots', async () => {
    vi.mocked(createClient).mockResolvedValue({} as any);
    mockGetServiceDuration.mockResolvedValueOnce(30);
    mockGetAvailableTimeSlotsUseCase.mockResolvedValueOnce({
      date: '2026-06-01',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      availableSlots: [],
    });

    const payload = {
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      date: '2026-06-01',
    };

    const result = await getAvailableTimeSlotsAction(payload as any);

    expect(result).toEqual({
      success: true,
      data: {
        date: '2026-06-01',
        serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        availableSlots: [],
      },
    });
    expect(mockGetAvailableTimeSlotsUseCase).toHaveBeenCalledWith(payload);
  });

  it('returns validation error on invalid input', async () => {
    const payload = {
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      date: 'invalid-date',
    };

    const result = await getAvailableTimeSlotsAction(payload as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(mockGetAvailableTimeSlotsUseCase).not.toHaveBeenCalled();
  });
});
