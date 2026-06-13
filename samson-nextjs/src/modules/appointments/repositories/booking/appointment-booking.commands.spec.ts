import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { createAppointmentCommand } from './appointment-booking.commands';
import { SubmitBookingDto } from '../../dtos';
import * as outboxCommandsModule from '@/shared/outbox/outbox.commands';

describe('AppointmentBookingCommands', () => {
  let mockSupabase: any;
  let mockEmitEvent: any;
  const validApptId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd2';
  const validServiceId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd3';
  const validDoctorId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd4';

  beforeEach(() => {
    mockEmitEvent = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(outboxCommandsModule, 'outboxCommands').mockReturnValue({
      emitEvent: mockEmitEvent,
    } as any);

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: validApptId,
          service_id: validServiceId,
          doctor_id: validDoctorId,
          status: 'PENDING',
          date: '2024-12-25',
          start_time: '2024-12-25T10:00:00Z',
          end_time: '2024-12-25T10:30:00Z',
        },
        error: null,
      }),
    };
  });

  describe('createAppointment', () => {
    const mockDto: SubmitBookingDto = {
      idempotencyKey: 'da95a63c-333e-4b68-98e3-82bdf1a07bd5',
      serviceId: validServiceId,
      doctorId: validDoctorId,
      isPreferredDoctor: true,
      date: '2024-12-25',
      startTime: '2024-12-25T10:00:00Z',
      endTime: '2024-12-25T10:30:00Z',
      userNote: 'Dental checkup',
      patientType: 'SELF',
    };

    it('should successfully insert a pending appointment', async () => {
      const command = createAppointmentCommand(mockSupabase as unknown as SupabaseClient);
      const result = await command('user-123', mockDto);

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: 'user-123',
          status: 'PENDING',
          service_id: mockDto.serviceId,
          doctor_id: mockDto.doctorId,
          dependent_id: null,
          date: mockDto.date,
          start_time: mockDto.startTime,
          end_time: mockDto.endTime,
          user_note: mockDto.userNote,
        })
      );
      expect(mockEmitEvent).toHaveBeenCalledWith('APPOINTMENT_BOOKED', expect.any(Object));
      expect(result).toMatchObject({ id: validApptId });
    });

    it('should throw DomainError on database error', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      const command = createAppointmentCommand(mockSupabase as unknown as SupabaseClient);
      await expect(command('user-123', mockDto)).rejects.toThrow(
        'Failed to create appointment: Insert failed'
      );
    });
  });
});
