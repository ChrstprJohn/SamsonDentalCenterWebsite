import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentStatusCommands } from './appointment-status.commands';

describe('AppointmentStatusCommands', () => {
  let commands: AppointmentStatusCommands;
  let mockSupabase: any;
  const validApptId = '1a95a63c-333e-4b68-98e3-82bdf1a07bd2';
  const validServiceId = '2a95a63c-333e-4b68-98e3-82bdf1a07bd2';
  const validDoctorId = '3a95a63c-333e-4b68-98e3-82bdf1a07bd2';
  const newDoctorId = '4a95a63c-333e-4b68-98e3-82bdf1a07bd2';

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: validApptId,
          service_id: validServiceId,
          doctor_id: validDoctorId,
          status: 'APPROVED',
        },
        error: null,
      }),
      rpc: vi.fn().mockResolvedValue({ error: null }),
    };
    commands = new AppointmentStatusCommands(mockSupabase as unknown as SupabaseClient);
  });

  describe('updateStatus', () => {
    it('should update appointment status with a reason', async () => {
      const result = await commands.updateStatus(validApptId, 'APPROVED', 'Schedule confirmed');

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'APPROVED',
          status_reason: 'Schedule confirmed',
        })
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', validApptId);
      expect(result).toMatchObject({ id: validApptId, status: 'APPROVED' });
    });

    it('should set status_reason to null when no reason is provided', async () => {
      await commands.updateStatus(validApptId, 'CHECKED_IN');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'CHECKED_IN',
          status_reason: null,
        })
      );
    });

    it('should atomically update schedule columns when reschedule metadata is provided', async () => {
      const reschedule = {
        date: '2025-01-15',
        startTime: '2025-01-15T09:00:00Z',
        endTime: '2025-01-15T09:30:00Z',
        doctorId: newDoctorId,
      };

      await commands.updateStatus(validApptId, 'APPROVED', 'Rescheduled by secretary', reschedule);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'APPROVED',
          status_reason: 'Rescheduled by secretary',
          date: '2025-01-15',
          start_time: '2025-01-15T09:00:00Z',
          end_time: '2025-01-15T09:30:00Z',
          doctor_id: newDoctorId,
        })
      );
    });

    it('should throw DomainError on database failure', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Update failed' } });

      await expect(commands.updateStatus(validApptId, 'CANCELLED', 'No longer needed')).rejects.toThrow(
        'Failed to update appointment status: Update failed'
      );
    });
  });

  describe('incrementUserCredibilityMetric', () => {
    it('should call RPC to increment cancel_count', async () => {
      const result = await commands.incrementUserCredibilityMetric('user-1', 'cancel_count');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_credibility_metric', {
        p_user_id: 'user-1',
        p_metric: 'cancel_count',
      });
      expect(result).toEqual({ success: true });
    });

    it('should call RPC to increment no_show_count', async () => {
      await commands.incrementUserCredibilityMetric('user-2', 'no_show_count');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_credibility_metric', {
        p_user_id: 'user-2',
        p_metric: 'no_show_count',
      });
    });

    it('should throw DomainError when RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({ error: { message: 'RPC error' } });

      await expect(commands.incrementUserCredibilityMetric('user-1', 'reschedule_count')).rejects.toThrow(
        "Failed to increment credibility metric 'reschedule_count': RPC error"
      );
    });
  });
});
