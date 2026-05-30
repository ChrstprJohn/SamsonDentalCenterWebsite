import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitBookingAction } from './submit-booking.action';
import { getAuthenticatedUser } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { SubmitBookingUseCase } from '../../use-cases';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/availability/get-availability.use-case');
vi.mock('../../use-cases/booking/submit-booking.use-case');

describe('submitBookingAction', () => {
  const mockSubmitBooking = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SubmitBookingUseCase).mockImplementation(function () {
      return {
        execute: mockSubmitBooking,
      } as any;
    });
  });

  it('successfully validates inputs, resolves auth, and submits booking', async () => {
    vi.mocked(createClient).mockResolvedValue({} as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: 'user_123' } as any);
    mockSubmitBooking.mockResolvedValue({ id: 'appt_999' });

    const payload = {
      idempotencyKey: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      doctorId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      date: '2026-06-01',
      startTime: '2026-06-01T09:00:00Z',
      endTime: '2026-06-01T09:30:00Z',
      patientType: 'SELF',
    };

    const result = await submitBookingAction(payload as any);

    expect(result).toEqual({
      success: true,
      data: { id: 'appt_999' },
    });
    expect(getAuthenticatedUser).toHaveBeenCalled();
    expect(mockSubmitBooking).toHaveBeenCalledWith('user_123', expect.objectContaining({
      patientType: 'SELF',
    }));
  });

  it('returns validation error if validation fails', async () => {
    const payload = {
      patientType: 'SELF',
    };

    const result = await submitBookingAction(payload as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(getAuthenticatedUser).not.toHaveBeenCalled();
  });
});
