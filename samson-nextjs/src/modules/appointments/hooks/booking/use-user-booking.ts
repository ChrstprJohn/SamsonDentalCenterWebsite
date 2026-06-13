'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { submitBookingAction } from '../../actions/booking/submit-booking.action';

import { useBookingState } from './use-booking-state';
import { useBookingData } from './use-booking-data';
import { createBookingPayload } from './submit-booking-payload.mapper';

export type BookingStep = 1 | 2 | 3 | 4;

export interface BookingSlot {
  time: string; // e.g. "09:00 AM"
  originalStartTime: string; // The raw ISO string from backend
  doctorId: string;
  doctorName: string;
  isPreferred?: boolean;
}

export interface NewDependentInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthday: string;
  relationship: string;
  clinicalNotes?: string;
}

interface UseUserBookingReturn {
  currentStep: BookingStep;
  selectedService: ServiceResponseDto | null;
  selectedDate: string | null;
  selectedSlot: BookingSlot | null;
  selectedDoctorId: string;
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
  
  availableDates: string[];
  availableSlots: BookingSlot[];
  doctors: any[];
  isLoadingAvailability: boolean;
  isLoadingDoctors: boolean;

  isSubmitting: boolean;
  isSuccess: boolean;
  createdAppointmentId: string | null;
  isNextDisabled: () => boolean;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: BookingStep) => void;
  selectService: (service: ServiceResponseDto) => void;
  selectDate: (date: string) => void;
  selectSlot: (slot: BookingSlot) => void;
  selectDoctor: (doctorId: string) => void;
  setPatientType: (type: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT') => void;
  setSelectedDependentId: (id: string | null) => void;
  setNewDependentData: (data: NewDependentInput | null) => void;
  setUserNote: (note: string) => void;
  validateAbuse: () => { valid: boolean; message?: string };
  resetWizard: () => void;
  handleSubmit: () => Promise<void>;
}

export function useUserBooking(
  services: ServiceResponseDto[] = [],
  userProfile?: any,
  userDependents?: any[]
): UseUserBookingReturn {
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const state = useBookingState();
  const data = useBookingData(state.selectedService?.id, state.selectedDate, state.selectedDoctorId, state.currentStep);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);

  // Auto-select service if passed in query param
  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId && services.length > 0 && !state.selectedService) {
      const found = services.find((s) => s.id === serviceId);
      if (found) {
        selectService(found);
      }
    }
  }, [searchParams, services, state.selectedService]);

  const nextStep = () => {
    if (state.currentStep === 1 && !state.selectedService) return;
    if (state.currentStep === 2 && (!state.selectedDate || !state.selectedSlot)) return;
    if (state.currentStep === 3) {
      if (state.patientType === 'EXISTING_DEPENDENT' && !state.selectedDependentId) return;
      if (state.patientType === 'NEW_DEPENDENT' && !state.newDependentData) return;
    }
    if (state.currentStep < 4) {
      state.setCurrentStep((prev) => (prev + 1) as BookingStep);
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      state.setCurrentStep((prev) => (prev - 1) as BookingStep);
    }
  };

  const goToStep = (step: BookingStep) => {
    if (step > 1 && !state.selectedService) return;
    if (step > 2 && (!state.selectedDate || !state.selectedSlot)) return;
    if (step > 3) {
      if (state.patientType === 'EXISTING_DEPENDENT' && !state.selectedDependentId) return;
      if (state.patientType === 'NEW_DEPENDENT' && !state.newDependentData) return;
    }
    state.setCurrentStep(step);
  };

  const selectService = (service: ServiceResponseDto) => {
    state.setSelectedService(service);
    state.setSelectedDate(null);
    state.setSelectedSlot(null);
    state.setSelectedDoctorId('ANY');
  };

  const selectDate = (date: string) => {
    state.setSelectedDate(date);
    state.setSelectedSlot(null);
  };

  const selectDoctor = (doctorId: string) => {
    state.setSelectedDoctorId(doctorId);
    state.setSelectedDate(null);
    state.setSelectedSlot(null);
  };

  const selectSlot = (slot: BookingSlot) => {
    state.setSelectedSlot(slot);
  };

  const validateAbuse = (): { valid: boolean; message?: string } => {
    if (state.userNote.toLowerCase().includes('spam') || state.userNote.length > 500) {
      return {
        valid: false,
        message: 'Suspicious request activity detected. Please review your booking details or contact the receptionist.',
      };
    }
    return { valid: true };
  };

  const resetWizard = () => {
    state.resetState();
    data.setAvailableDates([]);
    data.setAvailableSlots([]);
    setIsSuccess(false);
    setCreatedAppointmentId(null);
    setIsSubmitting(false);
  };

  const isNextDisabled = () => {
    if (state.currentStep === 1 && !state.selectedService) return true;
    if (state.currentStep === 2 && (!state.selectedDate || !state.selectedSlot)) return true;
    if (state.currentStep === 3) {
      if (state.patientType === 'EXISTING_DEPENDENT' && !state.selectedDependentId) return true;
      if (state.patientType === 'NEW_DEPENDENT' && !state.newDependentData) return true;
    }
    return false;
  };
  const handleSubmit = async () => {
    if (!state.selectedService || !state.selectedDate || !state.selectedSlot) {
      addToast('Missing booking details.', 'error');
      return;
    }

    const abuse = validateAbuse();
    if (!abuse.valid) {
      addToast(abuse.message || 'Suspicious booking activity detected.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    const payload = createBookingPayload({
      selectedService: state.selectedService,
      selectedSlot: state.selectedSlot,
      selectedDate: state.selectedDate,
      patientType: state.patientType,
      selectedDependentId: state.selectedDependentId,
      newDependentData: state.newDependentData,
      userNote: state.userNote,
    });

    try {
      const response = await submitBookingAction(payload);
      if (response.success) {
        setCreatedAppointmentId(response.data?.appointmentId || null);
        setIsSuccess(true);
        addToast('Appointment scheduled successfully!', 'success');
      } else {
        addToast(response.error || 'Failed to submit booking.', 'error');
      }
    } catch (err) {
      addToast('An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...state,
    ...data,
    isSubmitting,
    isSuccess,
    createdAppointmentId,
    isNextDisabled,
    nextStep,
    prevStep,
    goToStep,
    selectService,
    selectDate,
    selectSlot,
    selectDoctor,
    validateAbuse,
    resetWizard,
    handleSubmit,
  };
}
