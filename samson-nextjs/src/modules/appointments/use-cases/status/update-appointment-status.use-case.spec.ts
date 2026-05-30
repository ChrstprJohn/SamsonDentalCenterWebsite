import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateAppointmentStatusUseCase } from './update-appointment-status.use-case';
import { AppointmentStatusCommands } from '../repositories/appointment-status.commands';
import { SupabaseClient } from '@supabase/supabase-js';
import { ValidationError } from '@/shared/errors';

describe('UpdateAppointmentStatusUseCase', () => {
  let useCase: UpdateAppointmentStatusUseCase;
  let mockSupabase: any;
  let mockStatusCommands: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    mockStatusCommands = {
      updateStatus: vi.fn(),
      incrementUserCredibilityMetric: vi.fn(),
    };

    useCase = new UpdateAppointmentStatusUseCase(
      mockSupabase as unknown as SupabaseClient,
      mockStatusCommands as unknown as AppointmentStatusCommands
    );
  });

  it('should successfully update status and increment cancel_count when cancelled', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'appt-1', status: 'PENDING', user_id: 'user-123', reschedule_count: 0 },
      error: null,
    });

    mockStatusCommands.updateStatus.mockResolvedValueOnce({ id: 'appt-1', status: 'CANCELLED' });
    mockStatusCommands.incrementUserCredibilityMetric.mockResolvedValueOnce({ success: true });

    const result = await useCase.execute('appt-1', 'CANCELLED', 'No longer needed');

    expect(result.status).toBe('CANCELLED');
    expect(mockStatusCommands.updateStatus).toHaveBeenCalledWith(
      'appt-1',
      'CANCELLED',
      'No longer needed',
      undefined,
      0
    );
    expect(mockStatusCommands.incrementUserCredibilityMetric).toHaveBeenCalledWith(
      'user-123',
      'cancel_count'
    );
  });

  it('should block status updates from a terminal status (e.g. COMPLETED)', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'appt-1', status: 'COMPLETED', user_id: 'user-123', reschedule_count: 0 },
      error: null,
    });

    await expect(useCase.execute('appt-1', 'APPROVED')).rejects.toThrow(
      'Cannot transition appointment from terminal status: COMPLETED'
    );

    expect(mockStatusCommands.updateStatus).not.toHaveBeenCalled();
  });

  it('should allow rescheduling if reschedule_count is 0, updating status and incrementing reschedule_count', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'appt-1', status: 'APPROVED', user_id: 'user-123', reschedule_count: 0 },
      error: null,
    });

    const reschedule = {
      date: '2025-01-15',
      startTime: '2025-01-15T09:00:00Z',
      endTime: '2025-01-15T09:30:00Z',
      doctorId: 'doc-new',
    };

    mockStatusCommands.updateStatus.mockResolvedValueOnce({ id: 'appt-1', status: 'APPROVED', reschedule_count: 1 });
    mockStatusCommands.incrementUserCredibilityMetric.mockResolvedValueOnce({ success: true });

    const result = await useCase.execute('appt-1', 'APPROVED', 'Rescheduling', reschedule);

    expect(mockStatusCommands.updateStatus).toHaveBeenCalledWith(
      'appt-1',
      'APPROVED',
      'Rescheduling',
      reschedule,
      1
    );
    expect(mockStatusCommands.incrementUserCredibilityMetric).toHaveBeenCalledWith(
      'user-123',
      'reschedule_count'
    );
  });

  it('should throw ValidationError if reschedule limit of 1 is exceeded', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 'appt-1', status: 'APPROVED', user_id: 'user-123', reschedule_count: 1 },
      error: null,
    });

    const reschedule = {
      date: '2025-01-15',
      startTime: '2025-01-15T09:00:00Z',
      endTime: '2025-01-15T09:30:00Z',
      doctorId: 'doc-new',
    };

    await expect(
      useCase.execute('appt-1', 'APPROVED', 'Rescheduling second time', reschedule)
    ).rejects.toThrow('Maximum reschedule limit of 1 has been reached.');

    expect(mockStatusCommands.updateStatus).not.toHaveBeenCalled();
  });
});
