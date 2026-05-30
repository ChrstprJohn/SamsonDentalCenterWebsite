import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { AppointmentBookingCommands } from './appointment-booking.commands';
import { SubmitBookingDto } from '../dtos';

describe('AppointmentBookingCommands', () => {
  let commands: AppointmentBookingCommands;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'appt-123' }, error: null }),
    };
    commands = new AppointmentBookingCommands(mockSupabase as unknown as SupabaseClient);
  });

  describe('createAppointment', () => {
    const mockDto: SubmitBookingDto = {
      idempotencyKey: '00000000-0000-0000-0000-000000000000',
      serviceId: '1111f111-1111-1111-1111-111111111111',
      doctorId: '22222222-2222-2222-2222-222222222222',
      isPreferredDoctor: true,
      date: '2024-12-25',
      startTime: '2024-12-25T10:00:00Z',
      endTime: '2024-12-25T10:30:00Z',
      userNote: 'Dental checkup',
      patientType: 'SELF',
    };

    it('should successfully insert a pending appointment', async () => {
      const result = await commands.createAppointment('user-123', mockDto);

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          status: 'PENDING',
          idempotency_key: mockDto.idempotencyKey,
          service_id: mockDto.serviceId,
          doctor_id: mockDto.doctorId,
          is_preferred_doctor: true,
          date: mockDto.date,
          start_time: mockDto.startTime,
          end_time: mockDto.endTime,
          user_note: mockDto.userNote,
          patient_type: mockDto.patientType,
        })
      );
      expect(result).toEqual({ id: 'appt-123' });
    });

    it('should throw DomainError on database error', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      await expect(commands.createAppointment('user-123', mockDto)).rejects.toThrow(
        'Failed to create appointment: Insert failed'
      );
    });
  });
});
