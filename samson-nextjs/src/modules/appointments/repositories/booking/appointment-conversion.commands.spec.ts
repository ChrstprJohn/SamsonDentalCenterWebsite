import { describe, it, expect, vi } from 'vitest';
import { convertInquiryToAppointmentCommand } from './appointment-conversion.commands';
import { SupabaseClient } from '@supabase/supabase-js';

describe('convertInquiryToAppointmentCommand', () => {
  it('should successfully call convert_inquiry_to_appointment RPC', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: 'new-app-uuid', error: null });
    const mockSupabase = { rpc: mockRpc } as unknown as SupabaseClient;

    const command = convertInquiryToAppointmentCommand(mockSupabase);
    const payload = {
      inquiryId: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      serviceId: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      doctorId: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      date: '2026-06-25',
      startTime: '2026-06-25T10:00:00Z',
      endTime: '2026-06-25T10:30:00Z',
      patientNote: 'Urgently needs checkup',
      secretaryNotes: 'Confirmed over phone',
      linkedPatientId: '9a2f1d60-89ab-4b73-99fb-1d6c3c5a1d44',
    };

    const result = await command(payload, 'secretary-id');

    expect(mockRpc).toHaveBeenCalledWith('convert_inquiry_to_appointment', {
      p_inquiry_id: 'd3b07384-d113-4ec2-a5e6-ec083b0f5cc5',
      p_service_id: 'b3b07384-d113-4ec2-a5e6-ec083b0f5cc1',
      p_doctor_id: '5f89c670-8b1e-4505-8854-3e9a593e82d1',
      p_date: '2026-06-25',
      p_start_time: '2026-06-25T10:00:00Z',
      p_end_time: '2026-06-25T10:30:00Z',
      p_patient_note: 'Urgently needs checkup',
      p_secretary_notes: 'Confirmed over phone',
      p_patient_id: '9a2f1d60-89ab-4b73-99fb-1d6c3c5a1d44',
      p_secretary_user_id: 'secretary-id',
      p_first_name: null,
      p_middle_name: null,
      p_last_name: null,
      p_suffix: null,
      p_phone_number: null,
      p_email: null,
    });
    expect(result.appointmentId).toBe('new-app-uuid');
  });
});
