/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getClinicAppointmentsPageAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments-page.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { useSecretaryAppointments } from './use-secretary-appointments';

const scheduler = {
  availableDates: [],
  availabilityMap: {},
  availableDoctors: [],
  availableSlots: [],
  error: null,
  loadingKey: null,
  loadDoctorsForService: vi.fn(),
  loadAvailableDates: vi.fn(),
  loadDoctorsForDate: vi.fn(),
  loadAvailableSlots: vi.fn(),
};

vi.mock('server-only', () => ({}));
vi.mock('@/modules/appointments/hooks/shared/use-booking-scheduler', () => ({
  useBookingScheduler: () => scheduler,
}));
vi.mock('@/modules/appointments/actions/clinic/get-clinic-appointments-page.action', () => ({
  getClinicAppointmentsPageAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action', () => ({
  getStaffAppointmentByIdAction: vi.fn().mockResolvedValue({ success: true, data: null }),
}));
vi.mock('@/modules/staff/actions/management/get-doctors.action', () => ({
  getDoctorsAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/update-appointment-status.action', () => ({
  updateAppointmentStatusAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/resolve-no-show.action', () => ({
  resolveNoShowAction: vi.fn(),
}));
vi.mock('@/modules/services/actions/management/get-services.action', () => ({
  getServicesAction: vi.fn().mockResolvedValue({ data: [] }),
}));

const appointment = {
  id: 'appt-1',
  status: 'APPROVED',
  patient: { firstName: 'Mara', lastName: 'Dela Cruz' },
  patientId: 'patient-1',
  service: { name: 'Cleaning' },
  serviceId: 'service-1',
  doctorId: 'doctor-1',
  date: '2026-07-06',
  startTime: '2026-07-06T08:00:00Z',
  endTime: '2026-07-06T08:30:00Z',
  statusHistory: [],
};

describe('useSecretaryAppointments', () => {
  it('loads appointments and submits the cancellation payload', async () => {
    vi.mocked(getClinicAppointmentsPageAction).mockResolvedValue({ success: true, data: { items: [appointment], nextCursor: null, hasMore: false, total: 1 } } as any);
    vi.mocked(getDoctorsAction).mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(updateAppointmentStatusAction).mockResolvedValue({ success: true } as any);
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    const { result } = renderHook(() => useSecretaryAppointments());

    await waitFor(() => expect(result.current.filteredAppointments).toHaveLength(1));
    act(() => {
      result.current.setSelectedAppointmentId('appt-1');
    });
    act(() => {
      result.current.setCancelReasonPreset('Patient requested reschedule / cancellation');
    });
    await act(async () => result.current.submitCancel());

    expect(updateAppointmentStatusAction).toHaveBeenCalledWith({
      appointmentId: 'appt-1',
      status: 'CANCELLED',
      statusReason: 'Patient requested reschedule / cancellation',
      confirmationChannel: 'EMAIL',
    });
  });

  it('reschedules appointment with time change and correctly computes end time', async () => {
    vi.mocked(getClinicAppointmentsPageAction).mockResolvedValue({ success: true, data: { items: [appointment], nextCursor: null, hasMore: false, total: 1 } } as any);
    vi.mocked(getDoctorsAction).mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(updateAppointmentStatusAction).mockResolvedValue({ success: true } as any);

    const { result } = renderHook(() => useSecretaryAppointments());

    await waitFor(() => expect(result.current.filteredAppointments).toHaveLength(1));
    act(() => {
      result.current.setSelectedAppointmentId('appt-1');
    });
    act(() => {
      result.current.setShowRescheduleForm(true);
    });

    expect(result.current.rescheduleTime).toBe('08:00');
    expect(result.current.rescheduleEndTime).toBe('08:30');

    // Change start time to 10:00 (which previously would leave endTime at 08:30 and fail)
    act(() => {
      result.current.setRescheduleTime('10:00');
      result.current.setRescheduleEndTime('');
      result.current.setRescheduleJustification('Doctor requested adjustment');
    });

    await act(async () => result.current.submitReschedule());

    expect(updateAppointmentStatusAction).toHaveBeenCalledWith({
      appointmentId: 'appt-1',
      status: 'APPROVED',
      statusReason: 'Doctor requested adjustment',
      newDate: '2026-07-06',
      newStartTime: '2026-07-06T10:00:00Z',
      newEndTime: '2026-07-06T10:30:00Z',
      newDoctorId: 'doctor-1',
      newServiceId: 'service-1',
      confirmationChannel: 'EMAIL',
    });
  });
});
