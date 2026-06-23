/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useLandingView } from './use-landing-view.hook';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import { submitInquiryAction } from '@/modules/appointments/actions/booking/submit-inquiry.action';
import { InquiryResponseDto } from '@/modules/appointments/dtos/booking/submit-inquiry.dto';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/modules/appointments/actions/booking/submit-inquiry.action', () => ({
  submitInquiryAction: vi.fn(),
}));

describe('useLandingView', () => {
  const mockPush = vi.fn();
  const mockAddToast = vi.fn();
  const mockSubmitInquiryAction = vi.mocked(submitInquiryAction);

  const mockServices = [
    {
      id: 'd9b233a0-7f2a-43c2-bf72-881c00222a00',
      name: 'General Dentistry',
      description: 'Checkups and cleanings',
      price: 100,
      durationMinutes: 30,
      serviceType: 'GENERAL' as const,
      isActive: true,
      createdAt: '2026-06-24T00:00:00.000Z',
      updatedAt: '2026-06-24T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useToast).mockReturnValue({ addToast: mockAddToast } as unknown as ReturnType<typeof useToast>);
  });

  it('should handle booking CTA when authenticated', () => {
    const { result } = renderHook(() =>
      useLandingView({ isAuthenticated: true, services: mockServices })
    );

    act(() => {
      result.current.handleBookingCTA('s-1');
    });

    expect(mockPush).toHaveBeenCalledWith('/user?service=s-1');
  });

  it('should handle booking CTA when authenticated without service id', () => {
    const { result } = renderHook(() =>
      useLandingView({ isAuthenticated: true, services: mockServices })
    );

    act(() => {
      result.current.handleBookingCTA();
    });

    expect(mockPush).toHaveBeenCalledWith('/user');
  });

  it('should handle booking CTA when not authenticated', () => {
    const { result } = renderHook(() =>
      useLandingView({ isAuthenticated: false, services: mockServices })
    );

    act(() => {
      result.current.handleBookingCTA('s-1');
    });

    expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fuser%3Fservice%3Ds-1');
  });

  it('should validate contact form before submitting', async () => {
    const { result } = renderHook(() =>
      useLandingView({ isAuthenticated: false, services: mockServices })
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.contactForm.handleRealInquirySubmit({
        phone: '',
        pathway: 'd9b233a0-7f2a-43c2-bf72-881c00222a00',
        targetDate: '',
        notes: '',
      });
    });

    expect(mockAddToast).toHaveBeenCalledWith('Please fill out all required fields.', 'error');
    expect(success).toBe(false);
  });

  it('should handle contact form submission successfully', async () => {
    const mockInquiryResponse: InquiryResponseDto = {
      id: 'inq-1',
      firstName: 'John',
      middleName: undefined,
      lastName: 'Doe',
      suffix: undefined,
      phoneNumber: '+1234567890',
      email: 'john@example.com',
      preferredServiceId: 'd9b233a0-7f2a-43c2-bf72-881c00222a00',
      preferredServiceName: 'General Dentistry',
      preferredDate: '2026-06-30',
      patientNote: undefined,
      status: 'NEW',
      linkedAppointmentId: undefined,
      createdAt: '2026-06-24T00:00:00.000Z',
      updatedAt: '2026-06-24T00:00:00.000Z',
    };

    mockSubmitInquiryAction.mockResolvedValue({ success: true, data: mockInquiryResponse });

    const { result } = renderHook(() =>
      useLandingView({ isAuthenticated: false, services: mockServices })
    );

    act(() => {
      result.current.contactForm.setFirstName('John');
      result.current.contactForm.setLastName('Doe');
      result.current.contactForm.setContactEmail('john@example.com');
    });

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.contactForm.handleRealInquirySubmit({
        phone: '+1234567890',
        pathway: 'd9b233a0-7f2a-43c2-bf72-881c00222a00',
        targetDate: '2026-06-30',
        notes: 'Some notes',
      });
    });

    expect(mockSubmitInquiryAction).toHaveBeenCalledWith({
      firstName: 'John',
      middleName: undefined,
      lastName: 'Doe',
      suffix: undefined,
      email: 'john@example.com',
      phoneNumber: '+1234567890',
      preferredServiceId: 'd9b233a0-7f2a-43c2-bf72-881c00222a00',
      preferredDate: '2026-06-30',
      patientNote: 'Some notes',
    });

    expect(mockAddToast).toHaveBeenCalledWith(
      'Your consultation request has been submitted successfully!',
      'success'
    );
    expect(success).toBe(true);
    expect(result.current.contactForm.firstName).toBe('');
    expect(result.current.contactForm.middleName).toBe('');
    expect(result.current.contactForm.lastName).toBe('');
    expect(result.current.contactForm.suffix).toBe('');
    expect(result.current.contactForm.contactEmail).toBe('');
  });
});


