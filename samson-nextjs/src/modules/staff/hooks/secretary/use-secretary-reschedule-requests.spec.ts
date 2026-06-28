/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getDoctorScheduleAction } from '@/modules/appointments/actions/availability/get-doctor-schedule.action';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { useSecretaryRescheduleRequests } from './use-secretary-reschedule-requests';

vi.mock('@/modules/appointments/actions/clinic/get-clinic-appointments.action', () => ({
  getClinicAppointmentsAction: vi.fn(),
}));
vi.mock('@/modules/staff/actions/management/get-doctors.action', () => ({
  getDoctorsAction: vi.fn(),
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

const appointment = {
  id: 'appt-1',
  patientId: 'patient-1',
  dependentId: null,
  doctorId: 'doctor-1',
  proposedDoctorId: 'doctor-2',
  date: '2026-07-01',
  proposedDate: '2026-07-02',
};

describe('useSecretaryRescheduleRequests', () => {
  it('loads requests, details, and submits the staged decision', async () => {
    vi.mocked(getClinicAppointmentsAction).mockResolvedValue({ success: true, data: [appointment] } as any);
    vi.mocked(getDoctorsAction).mockResolvedValue({
      success: true,
      data: [{ id: 'doctor-2', prefix: 'Dr.', firstName: 'Mina', lastName: 'Reyes' }],
    } as any);
    vi.mocked(getPatientDetailsForStaffAction).mockResolvedValue({ success: true, data: { profile: { firstName: 'Ana' } } } as any);
    vi.mocked(getDoctorScheduleAction).mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(updateAppointmentStatusAction).mockResolvedValue({ success: true } as any);
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    const { result } = renderHook(() => useSecretaryRescheduleRequests());

    await waitFor(() => expect(result.current.appointments).toHaveLength(1));
    act(() => result.current.selectAppointment('appt-1'));
    await waitFor(() => expect(result.current.patientDetails?.profile.firstName).toBe('Ana'));

    act(() => {
      result.current.setDecision('APPROVED');
      result.current.setReason('Requested slot available');
    });
    await act(async () => result.current.finishReviewDecision('appt-1'));

    expect(updateAppointmentStatusAction).toHaveBeenCalledWith({
      appointmentId: 'appt-1',
      status: 'APPROVED',
      statusReason: 'Requested slot available',
    });
  });
});
