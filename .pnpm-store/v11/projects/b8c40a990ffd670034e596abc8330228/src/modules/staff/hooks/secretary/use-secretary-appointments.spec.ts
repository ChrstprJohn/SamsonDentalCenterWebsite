/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
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

vi.mock('@/modules/appointments/hooks/shared/use-booking-scheduler', () => ({
  useBookingScheduler: () => scheduler,
}));
vi.mock('@/modules/appointments/actions/clinic/get-clinic-appointments.action', () => ({
  getClinicAppointmentsAction: vi.fn(),
}));
vi.mock('@/modules/staff/actions/management/get-doctors.action', () => ({
  getDoctorsAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/update-appointment-status.action', () => ({
  updateAppointmentStatusAction: vi.fn(),
}));
vi.mock('@/modules/services/actions/management/get-services.action', () => ({
  getServicesAction: vi.fn(),
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
    vi.mocked(getClinicAppointmentsAction).mockResolvedValue({ success: true, data: [appointment] } as any);
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
    });
  });
});
