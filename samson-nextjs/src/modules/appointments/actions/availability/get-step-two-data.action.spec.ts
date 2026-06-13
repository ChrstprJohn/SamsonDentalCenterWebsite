import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStepTwoDataAction } from './get-step-two-data.action';
import { createClient } from '@/shared/database/server';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/server');

const { mockGetAvailableDaysUseCase, mockGetDoctorsUseCase, mockGetServiceDuration } = vi.hoisted(() => {
  return {
    mockGetAvailableDaysUseCase: vi.fn(),
    mockGetDoctorsUseCase: vi.fn(),
    mockGetServiceDuration: vi.fn(),
  };
});

vi.mock('../../use-cases/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getAvailableDaysUseCase: () => mockGetAvailableDaysUseCase,
    getAvailableTimeSlotsUseCase: () => vi.fn(),
  };
});

vi.mock('@/modules/staff/use-cases/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getDoctorsUseCase: () => mockGetDoctorsUseCase,
  };
});

vi.mock('../../repositories/exports', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    getServiceDurationQuery: () => mockGetServiceDuration,
    getDoctorSchedulesQuery: () => vi.fn(),
    getExistingAppointmentsQuery: () => vi.fn(),
    getWorkingSchedulesForMonthQuery: () => vi.fn(),
    getExistingAppointmentsForMonthQuery: () => vi.fn(),
  };
});

describe('getStepTwoDataAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully validates inputs and executes concurrently', async () => {
    vi.mocked(createClient).mockResolvedValue({} as any);
    mockGetServiceDuration.mockResolvedValueOnce(30);
    
    const mockDoctors = [
      { id: 'doc-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@samsondental.com', role: 'DOCTOR', isActive: true }
    ];
    const mockAvailability = {
      month: '2026-06',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      availableDates: ['2026-06-01'],
      availabilityMap: {},
    };

    mockGetDoctorsUseCase.mockResolvedValueOnce(mockDoctors);
    mockGetAvailableDaysUseCase.mockResolvedValueOnce(mockAvailability);

    const payload = {
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      month: '2026-06',
    };

    const result = await getStepTwoDataAction(payload as any);

    expect(result).toEqual({
      success: true,
      data: {
        doctors: mockDoctors,
        availability: mockAvailability,
      },
    });

    expect(mockGetDoctorsUseCase).toHaveBeenCalledWith(payload.serviceId);
    expect(mockGetAvailableDaysUseCase).toHaveBeenCalledWith(payload);
  });

  it('returns validation error on invalid input', async () => {
    const payload = {
      serviceId: 'invalid-uuid',
      month: 'invalid-month',
    };

    const result = await getStepTwoDataAction(payload as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(mockGetDoctorsUseCase).not.toHaveBeenCalled();
    expect(mockGetAvailableDaysUseCase).not.toHaveBeenCalled();
  });
});
