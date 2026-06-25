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

  const baseDto = {
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

  it('should call RPC with null dependent params when booking for self', async () => {
    const command = createManualBookingCommand(mockSupabase as unknown as SupabaseClient);
    const result = await command(baseDto);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_manual_booking', expect.objectContaining({
      p_patient_id: baseDto.patientId,
      p_service_id: baseDto.serviceId,
      p_doctor_id: baseDto.doctorId,
      p_date: baseDto.date,
      p_start_time: baseDto.startTime,
      p_end_time: baseDto.endTime,
      p_first_name: baseDto.firstName,
      p_middle_name: baseDto.middleName,
      p_last_name: baseDto.lastName,
      p_suffix: baseDto.suffix,
      p_phone_number: baseDto.phoneNumber,
      p_email: baseDto.email,
      p_patient_note: baseDto.patientNote,
      p_status_reason: baseDto.statusReason,
      p_secretary_user_id: baseDto.secretaryUserId,
      p_dependent_id: null,
      p_new_dependent_first_name: null,
      p_new_dependent_middle_name: null,
      p_new_dependent_last_name: null,
      p_new_dependent_suffix: null,
      p_new_dependent_date_of_birth: null,
      p_new_dependent_relationship: null,
    }));
    expect(result).toMatchObject({ appointmentId: validApptId });
  });

  it('should pass p_dependent_id when booking for existing dependent', async () => {
    const dto = { ...baseDto, dependentId: 'dep-uuid-123' };
    const command = createManualBookingCommand(mockSupabase as unknown as SupabaseClient);
    await command(dto);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_manual_booking', expect.objectContaining({
      p_dependent_id: 'dep-uuid-123',
      p_new_dependent_first_name: null,
    }));
  });

  it('should pass p_new_dependent_* fields when creating new dependent', async () => {
    const dto = {
      ...baseDto,
      newDependentFirstName: 'Maria',
      newDependentLastName: 'Santos',
      newDependentDateOfBirth: '2015-03-10',
      newDependentRelationship: 'CHILD' as const,
    };
    const command = createManualBookingCommand(mockSupabase as unknown as SupabaseClient);
    await command(dto);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_manual_booking', expect.objectContaining({
      p_dependent_id: null,
      p_new_dependent_first_name: 'Maria',
      p_new_dependent_last_name: 'Santos',
      p_new_dependent_date_of_birth: '2015-03-10',
      p_new_dependent_relationship: 'CHILD',
    }));
  });

  it('should throw DomainError on database error', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'Overlapping slot' } });

    const command = createManualBookingCommand(mockSupabase as unknown as SupabaseClient);
    await expect(command(baseDto)).rejects.toThrow(
      'Failed to create manual booking: Overlapping slot'
    );
  });
});
