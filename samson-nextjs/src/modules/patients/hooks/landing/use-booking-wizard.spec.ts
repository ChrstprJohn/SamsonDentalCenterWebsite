/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useBookingWizard } from './use-booking-wizard';
import { useToast } from '@/components/feedback/toast-container';
import { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/modules/appointments/actions/booking/submit-inquiry.action', () => ({
  submitInquiryAction: vi.fn(),
}));

describe('useBookingWizard', () => {
  const mockAddToast = vi.fn();

  const mockServices: ServiceResponseDto[] = [
    {
      id: 'd9b233a0-7f2a-43c2-bf72-881c00222a00',
      name: 'General Dentistry',
      description: 'Checkups and cleanings',
      price: 100,
      durationMinutes: 30,
      serviceType: 'GENERAL',
      isActive: true,
      status: 'ACTIVE',
      createdAt: '2026-06-24T00:00:00.000Z',
      updatedAt: '2026-06-24T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ addToast: mockAddToast } as unknown as ReturnType<typeof useToast>);
  });

  it('starts at step 1 (service card select) and advances to step 2 (schedule) & step 3 (patient)', () => {
    const { result } = renderHook(() =>
      useBookingWizard({ services: mockServices })
    );

    expect(result.current.step).toBe(1);

    // Select service card
    act(() => {
      result.current.selectService('d9b233a0-7f2a-43c2-bf72-881c00222a00');
    });

    act(() => {
      result.current.goToStep2();
    });

    expect(result.current.step).toBe(2);

    // Step 2 validation - requires target date
    act(() => {
      result.current.goToStep3();
    });
    expect(result.current.step).toBe(2);

    // Set target date & preferred time & advance to Step 3
    act(() => {
      result.current.contactSection.setTargetDate('2026-08-10');
      result.current.fields.setPreferredStartTime('09:00');
    });

    act(() => {
      result.current.goToStep3();
    });

    expect(result.current.step).toBe(3);
  });
});
