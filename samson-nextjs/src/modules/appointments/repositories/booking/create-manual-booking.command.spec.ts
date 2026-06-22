import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { createManualBookingCommand } from './create-manual-booking.command';

describe('createManualBookingCommand', () => {
  let mockSupabase: any;
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

  const mockManualDto = {
    patientId: 'patient-uuid',
    firstName: 'Jane',
    middleName: 'M',
    lastName: 'Doe',
    suffix: 'Jr',
    phoneNumber: '+1987654321',
    email: 'jane@example.com',
    serviceId: validServiceId,
    doctorId: validDoctorId,
    date: '2024-12-25',
    startTime: '2024-12-25T10:00:00Z',
    endTime: '2024-12-25T10:30:00Z',
    patientNote: 'Checkup note',
    statusReason: 'Call booking reason',
    secretaryUserId: 'sec-uuid',
  };

  it('should successfully call the rpc for manual booking creation', async () => {
    const command = createManualBookingCommand(mockSupabase as unknown as SupabaseClient);
    const result = await command(mockManualDto);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_manual_booking', {
      p_patient_id: mockManualDto.patientId,
      p_service_id: mockManualDto.serviceId,
      p_doctor_id: mockManualDto.doctorId,
      p_date: mockManualDto.date,
      p_start_time: mockManualDto.startTime,
      p_end_time: mockManualDto.endTime,
      p_first_name: mockManualDto.firstName,
      p_middle_name: mockManualDto.middleName,
      p_last_name: mockManualDto.lastName,
      p_suffix: mockManualDto.suffix,
      p_phone_number: mockManualDto.phoneNumber,
      p_email: mockManualDto.email,
      p_patient_note: mockManualDto.patientNote,
      p_status_reason: mockManualDto.statusReason,
      p_secretary_user_id: mockManualDto.secretaryUserId,
    });
    expect(result).toMatchObject({ appointmentId: validApptId });
  });

  it('should throw DomainError on database error', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'Overlapping slot' } });

    const command = createManualBookingCommand(mockSupabase as unknown as SupabaseClient);
    await expect(command(mockManualDto)).rejects.toThrow(
      'Failed to create manual booking: Overlapping slot'
    );
  });
});
