import { describe, it, expect, vi } from 'vitest';
import { requestRescheduleTransactionCommand } from './request-reschedule-transaction.command';

const PROPOSED = {
  date: '2026-07-01',
  startTime: '2026-07-01T09:00:00Z',
  endTime: '2026-07-01T09:30:00Z',
  doctorId: 'doctor-uuid-001',
};

const APPT_ID     = '123e4567-e89b-12d3-a456-426614174000';
const PATIENT_ID  = '123e4567-e89b-12d3-a456-426614174001';
const SERVICE_ID  = '123e4567-e89b-12d3-a456-426614174002';
const DOCTOR_ID   = '123e4567-e89b-12d3-a456-426614174003';

const DB_ROW = {
  id: APPT_ID,
  patient_id: PATIENT_ID,
  service_id: SERVICE_ID,
  doctor_id: DOCTOR_ID,
  status: 'RESCHEDULE_REQUESTED',
  date: '2026-07-01',
  start_time: '2026-07-01T09:00:00Z',
  end_time: '2026-07-01T09:30:00Z',
  proposed_date: '2026-07-01',
  proposed_start_time: '2026-07-01T09:00:00Z',
  proposed_end_time: '2026-07-01T09:30:00Z',
  proposed_doctor_id: DOCTOR_ID,
  reschedule_count: 1,
  status_reason: 'Schedule conflict',
  source: 'SELF_BOOKED',
  doctor_assignment_source: 'SYSTEM',
  user_note: null,
  dependent_id: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-26T00:00:00Z',
};

describe('requestRescheduleTransactionCommand', () => {
  it('calls rpc with correct snake_case params and returns mapped AppointmentDto', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: [DB_ROW], error: null });
    const supabase = { rpc: mockRpc } as any;

    const command = requestRescheduleTransactionCommand(supabase);
    const result = await command(APPT_ID, PATIENT_ID, 'PATIENT', 'Schedule conflict', PROPOSED);

    expect(mockRpc).toHaveBeenCalledWith('request_reschedule_transaction', {
      p_appointment_id:      APPT_ID,
      p_actor_id:            PATIENT_ID,
      p_actor_role:          'PATIENT',
      p_reason:              'Schedule conflict',
      p_proposed_date:       PROPOSED.date,
      p_proposed_start_time: PROPOSED.startTime,
      p_proposed_end_time:   PROPOSED.endTime,
      p_proposed_doctor_id:  PROPOSED.doctorId,
    });

    expect(result.id).toBe(APPT_ID);
    expect(result.status).toBe('RESCHEDULE_REQUESTED');
  });

  it('throws DomainError when rpc returns an error', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'DB failure' } });
    const supabase = { rpc: mockRpc } as any;

    const command = requestRescheduleTransactionCommand(supabase);

    await expect(
      command(APPT_ID, null, 'PATIENT', 'reason', PROPOSED)
    ).rejects.toThrow('Failed to request reschedule: DB failure');
  });

  it('throws DomainError when rpc returns empty array', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });
    const supabase = { rpc: mockRpc } as any;

    const command = requestRescheduleTransactionCommand(supabase);

    await expect(
      command(APPT_ID, null, 'PATIENT', 'reason', PROPOSED)
    ).rejects.toThrow('Failed to request reschedule');
  });
});
