import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableDaysAction } from './get-available-days.action';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/server');

const { mockGetAvailableDays } = vi.hoisted(() => {
  return { mockGetAvailableDays: vi.fn() };
});

vi.mock('../../use-cases/availability/get-availability.use-case', () => {
  return {
    getAvailabilityUseCase: () => ({
      getAvailableDays: mockGetAvailableDays,
    }),
    GetAvailabilityUseCase: class {
      getAvailableDays = mockGetAvailableDays;
    },
  };
});

describe('getAvailableDaysAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully validates inputs and executes getAvailableDays', async () => {
    vi.mocked(createClient).mockResolvedValue({} as any);
    mockGetAvailableDays.mockResolvedValue({
      month: '2026-06',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      availableDates: ['2026-06-01'],
    });

    const payload = {
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      month: '2026-06',
    };

    const result = await getAvailableDaysAction(payload as any);

    expect(result).toEqual({
      success: true,
      data: {
        month: '2026-06',
        serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
        availableDates: ['2026-06-01'],
      },
    });
    expect(mockGetAvailableDays).toHaveBeenCalledWith(payload);
  });

  it('returns validation error on invalid input', async () => {
    const payload = {
      serviceId: 'invalid-uuid',
      month: 'invalid-month',
    };

    const result = await getAvailableDaysAction(payload as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(mockGetAvailableDays).not.toHaveBeenCalled();
  });
});
