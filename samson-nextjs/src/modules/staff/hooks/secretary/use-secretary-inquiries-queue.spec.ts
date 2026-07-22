/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { convertInquiryAction } from '@/modules/appointments/actions/booking/convert-inquiry.action';
import { getInquiriesAction } from '@/modules/appointments/actions/booking/get-inquiries.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { useSecretaryInquiriesQueue } from './use-secretary-inquiries-queue';

vi.mock('server-only', () => ({}));


const scheduler = {
  availableDates: ['2026-07-09'],
  availabilityMap: {},
  availableDoctors: [{ doctorId: 'doctor-1', doctorName: 'Dr. Santos' }],
  availableSlots: [{ startTime: '08:00', endTime: '08:30' }],
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
vi.mock('@/modules/appointments/actions/booking/get-inquiries.action', () => ({
  getInquiriesAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/booking/convert-inquiry.action', () => ({
  convertInquiryAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/booking/drop-inquiry.action', () => ({
  dropInquiryAction: vi.fn(),
}));
vi.mock('@/modules/services/actions/management/get-services.action', () => ({
  getServicesAction: vi.fn(),
}));
vi.mock('@/modules/patients/actions/profile/search-patients.action', () => ({
  searchPatientsAction: vi.fn(),
}));
vi.mock('@/modules/staff/actions/management/get-doctors.action', () => ({
  getDoctorsAction: vi.fn(),
}));


const inquiry = {
  id: 'inq-1',
  firstName: 'Ella',
  middleName: 'Mae',
  lastName: 'Ramos',
  suffix: '',
  phoneNumber: '+639171111111',
  email: 'ella@example.com',
  preferredServiceId: 'service-1',
  preferredServiceName: 'Cleaning',
  preferredDate: '2026-07-09',
  patientNote: 'Sensitive tooth',
  status: 'NEW',
};


describe('useSecretaryInquiriesQueue', () => {
  it('converts an inquiry with the expected payload', async () => {
    vi.mocked(getInquiriesAction).mockResolvedValueOnce({ success: true, data: [inquiry] } as any)
      .mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(getServicesAction).mockResolvedValue({ success: true, data: [{ id: 'service-1', name: 'Cleaning' }] } as any);
    vi.mocked(getDoctorsAction).mockResolvedValue({ success: true, data: [{ id: 'doctor-1', firstName: 'Santos', lastName: '' }] } as any);
    vi.mocked(convertInquiryAction).mockResolvedValue({ success: true } as any);


    const { result } = renderHook(() => useSecretaryInquiriesQueue());

    await waitFor(() => expect(result.current.inquiries).toHaveLength(1));
    act(() => {
      result.current.selectInquiry(inquiry);
      result.current.setDecision('CONVERT');
      result.current.selectDate('2026-07-09');
      result.current.selectDoctor('doctor-1');
      result.current.selectSlot({ startTime: '08:00', endTime: '08:30' });
      result.current.setSecretaryNotes('Confirmed by phone');
    });
    await act(async () => result.current.submitReview('inq-1'));

    expect(convertInquiryAction).toHaveBeenCalledWith({
      inquiryId: 'inq-1',
      serviceId: 'service-1',
      doctorId: 'doctor-1',
      date: '2026-07-09',
      startTime: '08:00',
      endTime: '08:30',
      patientNote: 'Sensitive tooth',
      secretaryNotes: 'Confirmed by phone',
      linkedPatientId: undefined,
      guestFirstName: 'Ella',
      guestMiddleName: 'Mae',
      guestLastName: 'Ramos',
      guestSuffix: undefined,
      guestPhone: '+639171111111',
      guestEmail: 'ella@example.com',
      doctorAssignmentSource: 'USER',
      confirmationChannel: 'EMAIL',
    });
  });
});
