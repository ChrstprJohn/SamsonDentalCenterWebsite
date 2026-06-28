/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getAvailableDaysAction } from '@/modules/appointments/actions/availability/get-available-days.action';
import { getAvailableTimeSlotsAction } from '@/modules/appointments/actions/availability/get-available-time-slots.action';
import { getDoctorScheduleAction } from '@/modules/appointments/actions/availability/get-doctor-schedule.action';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { useSecretaryPendingRequests } from './use-secretary-pending-requests';

vi.mock('@/modules/appointments/actions/clinic/get-clinic-appointments.action', () => ({
  getClinicAppointmentsAction: vi.fn(),
}));
vi.mock('@/modules/patients/actions/profile/get-patient-details-for-staff.action', () => ({
  getPatientDetailsForStaffAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/availability/get-doctor-schedule.action', () => ({
  getDoctorScheduleAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/update-appointment-status.action', () => ({
  updateAppointmentStatusAction: vi.fn(),
}));
vi.mock('@/modules/services/actions/management/get-services.action', () => ({
  getServicesAction: vi.fn(),
}));
vi.mock('@/modules/staff/actions/management/get-doctors.action', () => ({
  getDoctorsAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/availability/get-available-days.action', () => ({
  getAvailableDaysAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/availability/get-available-time-slots.action', () => ({
  getAvailableTimeSlotsAction: vi.fn(),
}));

const appointment = {
  id: 'appt-1',
  patientId: 'patient-1',
  dependentId: null,
  serviceId: 'service-1',
  doctorId: 'doctor-1',
  date: '2026-07-01',
  startTime: '2026-07-01T08:00:00Z',
  endTime: '2026-07-01T08:30:00Z',
};

describe('useSecretaryPendingRequests', () => {
  it('loads pending details and submits edited review payload', async () => {
    vi.mocked(getClinicAppointmentsAction).mockResolvedValue({ success: true, data: [appointment] } as any);
    vi.mocked(getPatientDetailsForStaffAction).mockResolvedValue({ success: true, data: { profile: { firstName: 'Mila' }, history: [] } } as any);
    vi.mocked(getDoctorScheduleAction).mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(getServicesAction).mockResolvedValue({ success: true, data: [{ id: 'service-2', name: 'Cleaning' }] } as any);
    vi.mocked(getDoctorsAction).mockResolvedValue({ success: true, data: [{ id: 'doctor-2', firstName: 'Nia', lastName: 'Cruz' }] } as any);
    vi.mocked(getAvailableDaysAction).mockResolvedValue({ success: true, data: { availableDates: ['2026-07-03'] } } as any);
    vi.mocked(getAvailableTimeSlotsAction).mockResolvedValue({ success: true, data: { availableSlots: [{ startTime: '2026-07-03T09:00:00Z', endTime: '2026-07-03T09:30:00Z' }] } } as any);
    vi.mocked(updateAppointmentStatusAction).mockResolvedValue({ success: true } as any);
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    const { result } = renderHook(() => useSecretaryPendingRequests());

    await waitFor(() => expect(result.current.appointments).toHaveLength(1));
    act(() => result.current.selectAppointment('appt-1'));
    await waitFor(() => expect(result.current.patientDetails?.profile.firstName).toBe('Mila'));

    act(() => result.current.toggleEditing());
    await waitFor(() => expect(result.current.editServices).toHaveLength(1));
    act(() => result.current.setEditService('service-2'));
    await waitFor(() => expect(result.current.editDoctors).toHaveLength(1));
    act(() => result.current.setEditDoctor('doctor-2'));
    await waitFor(() => expect(result.current.editAvailableDates).toContain('2026-07-03'));
    act(() => result.current.setEditAppointmentDate('2026-07-03'));
    await waitFor(() => expect(result.current.editSlots).toHaveLength(1));

    act(() => {
      result.current.setEditSlot({ startTime: '2026-07-03T09:00:00Z', endTime: '2026-07-03T09:30:00Z' });
      result.current.setDecision('APPROVED');
      result.current.setReason('Roster schedule cleared');
    });
    await act(async () => result.current.finishAppointmentReview('appt-1'));

    expect(updateAppointmentStatusAction).toHaveBeenCalledWith({
      appointmentId: 'appt-1',
      status: 'APPROVED',
      statusReason: 'Roster schedule cleared',
      newServiceId: 'service-2',
      newDoctorId: 'doctor-2',
      newDate: '2026-07-03',
      newStartTime: '2026-07-03T09:00:00Z',
      newEndTime: '2026-07-03T09:30:00Z',
    });
  });
});
