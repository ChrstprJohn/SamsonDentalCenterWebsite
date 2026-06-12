/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BookingView } from './booking-view';
import { useUserBooking } from '../hooks/booking/use-user-booking';

vi.mock('../hooks/booking/use-user-booking', () => ({
  useUserBooking: vi.fn(),
}));

vi.mock('../components/booking/progress-tabs', () => ({
  ProgressTabs: () => <div data-testid="progress-tabs">Progress Tabs</div>,
}));

vi.mock('../components/booking/service-step', () => ({
  ServiceStep: () => <div data-testid="service-step">Service Step</div>,
}));

vi.mock('../components/booking/date-time-step', () => ({
  DateTimeStep: () => <div data-testid="date-time-step">Date Time Step</div>,
}));

vi.mock('../components/booking/patient-details-step', () => ({
  PatientDetailsStep: () => <div data-testid="patient-details-step">Patient Details Step</div>,
}));

vi.mock('../components/booking/review-step', () => ({
  ReviewStep: () => <div data-testid="review-step">Review Step</div>,
}));

vi.mock('../components/booking/booking-success-view', () => ({
  BookingSuccessView: () => <div data-testid="success-view">Success View</div>,
}));

describe('BookingView', () => {
  const defaultMockState = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null,
    selectedSlot: null,
    availableDates: [],
    availableSlots: [],
    isLoadingAvailability: false,
    patientType: 'SELF',
    selectedDependentId: null,
    newDependentData: null,
    userNote: '',
    isSubmitting: false,
    isSuccess: false,
    
    setCurrentStep: vi.fn(),
    setSelectedService: vi.fn(),
    setSelectedDate: vi.fn(),
    setSelectedSlot: vi.fn(),
    setPatientType: vi.fn(),
    setSelectedDependentId: vi.fn(),
    setNewDependentData: vi.fn(),
    setUserNote: vi.fn(),
    
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    goToStep: vi.fn(),
    isNextDisabled: () => false,
    handleSubmit: vi.fn(),
    resetWizard: vi.fn(),
  };

  it('should render ServiceStep on step 1', () => {
    (useUserBooking as any).mockReturnValue({ ...defaultMockState, currentStep: 1 });
    render(<BookingView services={[]} />);
    
    expect(screen.getByTestId('service-step')).toBeDefined();
    expect(screen.queryByTestId('date-time-step')).toBeNull();
  });

  it('should render DateTimeStep on step 2', () => {
    (useUserBooking as any).mockReturnValue({ ...defaultMockState, currentStep: 2 });
    render(<BookingView services={[]} />);
    
    expect(screen.getByTestId('date-time-step')).toBeDefined();
  });

  it('should render PatientDetailsStep on step 3', () => {
    (useUserBooking as any).mockReturnValue({ ...defaultMockState, currentStep: 3 });
    render(<BookingView services={[]} />);
    
    expect(screen.getByTestId('patient-details-step')).toBeDefined();
  });

  it('should render ReviewStep on step 4', () => {
    (useUserBooking as any).mockReturnValue({ ...defaultMockState, currentStep: 4 });
    render(<BookingView services={[]} />);
    
    expect(screen.getByTestId('review-step')).toBeDefined();
  });

  it('should render SuccessView when isSuccess is true', () => {
    (useUserBooking as any).mockReturnValue({ ...defaultMockState, isSuccess: true });
    render(<BookingView services={[]} />);
    
    expect(screen.getByTestId('success-view')).toBeDefined();
    expect(screen.queryByTestId('progress-tabs')).toBeNull();
  });
});
