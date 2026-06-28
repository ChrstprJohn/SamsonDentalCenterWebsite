import { describe, it, expect, vi } from 'vitest';
import { updateAppointmentStatusTransactionCommand } from './update-appointment-status-transaction.command';

const APPT_ID   = '123e4567-e89b-12d3-a456-426614174000';
const ACTOR_ID  = '123e4567-e89b-12d3-a456-426614174001';
const PATIENT_ID = '123e4567-e89b-12d3-a456-426614174002';
const DOCTOR_ID = '123e4567-e89b-12d3-a456-426614174003';

const DB_ROW = {
  id: APPT_ID,
  patient_id: PATIENT_ID,
  service_id: '123e4567-e89b-12d3-a456-426614174004',
  doctor_id: DOCTOR_ID,
  status: 'APPROVED',
  date: '2026-07-01',
  start_time: '2026-07-01T09:00:00Z',
  end_time: '2026-07-01T09:30:00Z',
  proposed_date: null,
  proposed_start_time: null,
  proposed_end_time: null,
  proposed_doctor_id: null,
  reschedule_count: 0,
  status_reason: 'Approved by staff',
  source: 'SELF_BOOKED',
  doctor_assignment_source: 'SYSTEM',
  user_note: null,
  dependent_id: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-26T00:00:00Z',
};

describe('updateAppointmentStatusTransactionCommand', () => {
  it('calls rpc with correct snake_case params for simple status update', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: [DB_ROW], error: null });
    const supabase = { rpc: mockRpc } as any;

    const command = updateAppointmentStatusTransactionCommand(supabase);
    const result = await command(APPT_ID, ACTOR_ID, 'STAFF', 'APPROVED', 'Approved by staff');

    expect(mockRpc).toHaveBeenCalledWith('update_appointment_status_transaction', {
      p_appointment_id:    APPT_ID,
      p_actor_id:          ACTOR_ID,
      p_actor_role:        'STAFF',
      p_new_status:        'APPROVED',
      p_reason:            'Approved by staff',
      p_reschedule_date:   null,
      p_reschedule_start:  null,
      p_reschedule_end:    null,
      p_reschedule_doctor: null,
      p_reschedule_service: null,
      p_clear_proposed:    false,
      p_reschedule_count:  null,
      p_expected_status:   null,
    });

    expect(result.id).toBe(APPT_ID);
    expect(result.status).toBe('APPROVED');
  });

  it('calls rpc with reschedule metadata when provided', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: [DB_ROW], error: null });
    const supabase = { rpc: mockRpc } as any;

    const command = updateAppointmentStatusTransactionCommand(supabase);
    await command(APPT_ID, ACTOR_ID, 'STAFF', 'APPROVED', 'Rescheduled', {
      date: '2026-07-01',
      startTime: '2026-07-01T09:00:00Z',
      endTime: '2026-07-01T09:30:00Z',
      doctorId: DOCTOR_ID,
    }, false, 1);

    expect(mockRpc).toHaveBeenCalledWith('update_appointment_status_transaction', expect.objectContaining({
      p_reschedule_date:   '2026-07-01',
      p_reschedule_start:  '2026-07-01T09:00:00Z',
      p_reschedule_end:    '2026-07-01T09:30:00Z',
      p_reschedule_doctor: DOCTOR_ID,
      p_reschedule_count:  1,
    }));
  });

  it('calls rpc with p_clear_proposed=true when flag set', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: [DB_ROW], error: null });
    const supabase = { rpc: mockRpc } as any;

    const command = updateAppointmentStatusTransactionCommand(supabase);
    await command(APPT_ID, ACTOR_ID, 'STAFF', 'APPROVED', 'Approved', undefined, true);

    expect(mockRpc).toHaveBeenCalledWith('update_appointment_status_transaction', expect.objectContaining({
      p_clear_proposed: true,
    }));
  });

  it('throws DomainError when rpc returns an error', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB failure' } });
    const supabase = { rpc: mockRpc } as any;

    const command = updateAppointmentStatusTransactionCommand(supabase);

    await expect(
      command(APPT_ID, null, 'STAFF', 'CANCELLED', 'No show')
    ).rejects.toThrow('Failed to update appointment status: DB failure');
  });

  it('throws DomainError when rpc returns empty array', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });
    const supabase = { rpc: mockRpc } as any;

    const command = updateAppointmentStatusTransactionCommand(supabase);

    await expect(
      command(APPT_ID, null, 'STAFF', 'CANCELLED', 'reason')
    ).rejects.toThrow('Failed to update appointment status');
  });
});
