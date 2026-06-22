import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { executeBookingTransactionCommand } from './appointment-booking.commands';
import { SubmitBookingDto } from '../../dtos/exports';

describe('AppointmentBookingCommands', () => {
  let mockSupabase: any;
  let mockEmitEvent: any;
  const validApptId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd2';
  const validServiceId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd3';
  const validDoctorId = 'da95a63c-333e-4b68-98e3-82bdf1a07bd4';

  beforeEach(() => {
    mockSupabase = {
      rpc: vi.fn().mockResolvedValue({
        data: validApptId,
        error: null,
      }),
    };
  });

  describe('executeBookingTransaction', () => {
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

    it('should successfully call the rpc for booking transaction', async () => {
      const command = executeBookingTransactionCommand(mockSupabase as unknown as SupabaseClient);
      const result = await command('user-123', mockDto);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('submit_booking_transaction', {
        p_patient_id: 'user-123',
        p_service_id: mockDto.serviceId,
        p_doctor_id: mockDto.doctorId,
        p_date: mockDto.date,
        p_start_time: mockDto.startTime,
        p_end_time: mockDto.endTime,
        p_user_note: mockDto.userNote,
        p_existing_dependent_id: null,
        p_new_dependent_first_name: null,
        p_new_dependent_last_name: null,
        p_new_dependent_date_of_birth: null,
        p_new_dependent_relationship: null,
        p_new_dependent_middle_name: null,
        p_new_dependent_suffix: null,
      });
      expect(result).toMatchObject({ appointmentId: validApptId });
    });

    it('should throw DomainError on database error', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      const command = executeBookingTransactionCommand(mockSupabase as unknown as SupabaseClient);
      await expect(command('user-123', mockDto)).rejects.toThrow(
        'Failed to submit booking: Insert failed'
      );
    });
  });
});

