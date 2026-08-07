/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useUserDashboardSummary } from './use-user-dashboard-summary';
import type { AppointmentDto } from '../../dtos/shared/appointment.dto';

const appointment = (id: string, status: AppointmentDto['status'], date: string, startTime: string): AppointmentDto =>
  ({
    id,
    patientId: null,
    dependentId: null,
    serviceId: 'service-1',
    doctorId: 'doctor-1',
    date,
    startTime,
    endTime: '11:00',
    status,
    source: 'SELF_BOOKED',
    doctorAssignmentSource: 'SYSTEM',
    userNote: null,
    statusReason: null,
    proposedDate: null,
    proposedStartTime: null,
    proposedEndTime: null,
    proposedDoctorId: null,
    rescheduleCount: 0,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    doctor: null,
    service: null,
    patient: null,
    dependent: null,
    statusHistory: [],
    preferredStartTime: null,
    proposedPreferredStartTime: null,
    guestContact: null,
  } as unknown as AppointmentDto);

describe('useUserDashboardSummary', () => {
  it('selects the nearest actionable upcoming appointment', () => {
    const futureSoon = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const futureLater = new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0];
    const { result } = renderHook(() =>
      useUserDashboardSummary([
        appointment('later', 'APPROVED', futureLater, '10:00'),
        appointment('cancelled', 'CANCELLED', futureSoon, '09:00'),
        appointment('soon', 'CHECKED_IN', futureSoon, '08:30'),
      ])
    );

    expect(result.current.nextAppointment?.id).toBe('soon');
  });

  it('formats 24-hour time for display', () => {
    const { result } = renderHook(() => useUserDashboardSummary([]));

    expect(result.current.formatTime('13:05')).toBe('1:05 PM');
    expect(result.current.formatTime('')).toBe('');
  });
});
