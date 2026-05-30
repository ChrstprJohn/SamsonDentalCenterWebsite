import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableTimeSlotsAction } from './get-available-time-slots.action';
import { createClient } from '@/shared/database/server';
import { GetAvailabilityUseCase } from '../../use-cases';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/availability/get-availability.use-case');

describe('getAvailableTimeSlotsAction', () => {
  const mockGetAvailableTimeSlots = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GetAvailabilityUseCase).mockImplementation(function () {
      return {
        getAvailableTimeSlots: mockGetAvailableTimeSlots,
      } as any;
    });
  });

  it('successfully validates inputs and executes getAvailableTimeSlots', async () => {
    vi.mocked(createClient).mockResolvedValue({} as any);
    mockGetAvailableTimeSlots.mockResolvedValue({
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
    expect(mockGetAvailableTimeSlots).toHaveBeenCalledWith(payload);
  });

  it('returns validation error on invalid input', async () => {
    const payload = {
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      date: 'invalid-date',
    };

    const result = await getAvailableTimeSlotsAction(payload as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(mockGetAvailableTimeSlots).not.toHaveBeenCalled();
  });
});
