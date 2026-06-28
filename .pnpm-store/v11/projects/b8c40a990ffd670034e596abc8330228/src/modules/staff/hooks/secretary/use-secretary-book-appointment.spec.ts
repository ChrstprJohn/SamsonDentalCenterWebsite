/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createManualBookingAction } from '@/modules/appointments/actions/booking/create-manual-booking.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { useSecretaryBookAppointment } from './use-secretary-book-appointment';

const scheduler = {
  availableDates: ['2026-07-04'],
  availabilityMap: {},
  availableDoctors: [{ doctorId: 'doctor-1', doctorName: 'Dr. Reyes' }],
  availableSlots: [{ startTime: '2026-07-04T08:00:00Z', endTime: '2026-07-04T08:30:00Z' }],
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
vi.mock('@/modules/appointments/actions/booking/create-manual-booking.action', () => ({
  createManualBookingAction: vi.fn(),
}));
vi.mock('@/modules/services/actions/management/get-services.action', () => ({
  getServicesAction: vi.fn(),
}));
vi.mock('@/modules/patients/actions/profile/search-patients.action', () => ({
  searchPatientsAction: vi.fn(),
}));
vi.mock('@/modules/patients/actions/dependents/get-user-dependents.action', () => ({
  getUserDependentsAction: vi.fn(),
}));

describe('useSecretaryBookAppointment', () => {
  it('submits the manual guest booking payload unchanged', async () => {
    vi.mocked(getServicesAction).mockResolvedValue({ success: true, data: [{ id: 'service-1', name: 'Cleaning' }] } as any);
    vi.mocked(createManualBookingAction).mockResolvedValue({ success: true } as any);

    const { result } = renderHook(() => useSecretaryBookAppointment());

    await waitFor(() => expect(result.current.services).toHaveLength(1));
    act(() => {
      result.current.switchPatientMode('GUEST');
      result.current.setFirstName('Lia');
      result.current.setMiddleName('Mae');
      result.current.setLastName('Santos');
      result.current.setSuffix('Jr.');
      result.current.setPhoneNumber('+639171234567');
      result.current.setEmail('lia@example.com');
      result.current.selectService('service-1');
      result.current.selectDate('2026-07-04');
      result.current.selectDoctor('doctor-1');
      result.current.selectTimeslot({ startTime: '2026-07-04T08:00:00Z', endTime: '2026-07-04T08:30:00Z' });
      result.current.setPatientNote('Prefers morning visit');
    });

    await act(async () => result.current.submit());

    expect(createManualBookingAction).toHaveBeenCalledWith({
      serviceId: 'service-1',
      doctorId: 'doctor-1',
      date: '2026-07-04',
      startTime: '2026-07-04T08:00:00Z',
      endTime: '2026-07-04T08:30:00Z',
      patientNote: 'Prefers morning visit',
      firstName: 'Lia',
      middleName: 'Mae',
      lastName: 'Santos',
      suffix: 'Jr.',
      phoneNumber: '+639171234567',
      email: 'lia@example.com',
    });
    expect(result.current.booked).toBe(true);
  });
});
