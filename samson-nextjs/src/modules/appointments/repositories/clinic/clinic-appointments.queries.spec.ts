import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAppointmentsByClinicQuery } from './clinic-appointments.queries';

describe('ClinicAppointmentsQueries', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
  });

  it('should call select with status_history and order by start_time', async () => {
    // Arrange
    const mockAppointments = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        service_id: '123e4567-e89b-12d3-a456-426614174001',
        doctor_id: '123e4567-e89b-12d3-a456-426614174002',
        date: '2026-06-01',
        start_time: '2026-06-01T10:00:00Z',
        end_time: '2026-06-01T11:00:00Z',
        status: 'APPROVED',
        doctor_assignment_source: 'SYSTEM',
        status_history: [
          {
            id: 'sh-1',
            previous_status: null,
            new_status: 'APPROVED',
            reason: 'Initial booking',
            created_at: '2026-06-01T09:00:00Z',
            actor_role: 'PATIENT',
          }
        ]
      }
    ];

    mockSupabase.eq.mockResolvedValue({ data: mockAppointments, error: null });

    const getAppointments = getAppointmentsByClinicQuery(mockSupabase as any);

    // Act
    const result = await getAppointments({ date: '2026-06-01' });

    // Assert
    expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
    expect(mockSupabase.select).toHaveBeenCalledWith(
      expect.stringContaining('status_history:appointment_status_history')
    );
    expect(mockSupabase.order).toHaveBeenCalledWith('start_time', { ascending: true });
    expect(result.length).toBe(1);
    expect(result[0].statusHistory.length).toBe(1);
    expect(result[0].statusHistory[0].newStatus).toBe('APPROVED');
  });
});
