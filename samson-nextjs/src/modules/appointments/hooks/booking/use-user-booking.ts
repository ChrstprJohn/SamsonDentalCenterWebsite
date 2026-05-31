'use client';

import { useState, useEffect, useRef } from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

export type BookingStep = 1 | 2 | 3 | 4;

export interface BookingSlot {
  time: string; // e.g. "09:00"
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
  sex: 'MALE' | 'FEMALE';
  relationship: string;
  clinicalNotes?: string;
}

interface UseUserBookingReturn {
  currentStep: BookingStep;
  selectedService: ServiceResponseDto | null;
  selectedDate: string | null;
  selectedSlot: BookingSlot | null;
  slotHoldRemaining: number;
  isSlotHoldActive: boolean;
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: BookingStep) => void;
  selectService: (service: ServiceResponseDto) => void;
  selectDate: (date: string) => void;
  selectSlot: (slot: BookingSlot) => void;
  startSlotHold: () => void;
  releaseSlotHold: () => void;
  setPatientType: (type: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT') => void;
  setSelectedDependentId: (id: string | null) => void;
  setNewDependentData: (data: NewDependentInput | null) => void;
  setUserNote: (note: string) => void;
  setTermsAccepted: (accepted: boolean) => void;
  setPrivacyAccepted: (accepted: boolean) => void;
  validateAbuse: () => { valid: boolean; message?: string };
  resetWizard: () => void;
}

const HOLD_DURATION_SECONDS = 600; // 10 minutes

export function useUserBooking(): UseUserBookingReturn {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<ServiceResponseDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [slotHoldRemaining, setSlotHoldRemaining] = useState<number>(HOLD_DURATION_SECONDS);
  const [isSlotHoldActive, setIsSlotHoldActive] = useState<boolean>(false);
  const [patientType, setPatientType] = useState<'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT'>('SELF');
  const [selectedDependentId, setSelectedDependentId] = useState<string | null>(null);
  const [newDependentData, setNewDependentData] = useState<NewDependentInput | null>(null);
  const [userNote, setUserNote] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle countdown logic
  useEffect(() => {
    if (isSlotHoldActive && slotHoldRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setSlotHoldRemaining((prev) => prev - 1);
      }, 1000);
    } else if (slotHoldRemaining === 0) {
      releaseSlotHold();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isSlotHoldActive, slotHoldRemaining]);

  const nextStep = () => {
    // Step-by-step validations
    if (currentStep === 1 && !selectedService) return;
    if (currentStep === 2 && (!selectedDate || !selectedSlot)) return;
    if (currentStep === 3) {
      if (patientType === 'EXISTING_DEPENDENT' && !selectedDependentId) return;
      if (patientType === 'NEW_DEPENDENT' && !newDependentData) return;
    }
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as BookingStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BookingStep);
    }
  };

  const goToStep = (step: BookingStep) => {
    // Ensure prerequisites are met
    if (step > 1 && !selectedService) return;
    if (step > 2 && (!selectedDate || !selectedSlot)) return;
    if (step > 3) {
      if (patientType === 'EXISTING_DEPENDENT' && !selectedDependentId) return;
      if (patientType === 'NEW_DEPENDENT' && !newDependentData) return;
    }
    setCurrentStep(step);
  };

  const selectService = (service: ServiceResponseDto) => {
    setSelectedService(service);
    // Reset subsequent steps upon changing service
    setSelectedDate(null);
    setSelectedSlot(null);
    releaseSlotHold();
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    releaseSlotHold();
  };

  const selectSlot = (slot: BookingSlot) => {
    setSelectedSlot(slot);
    startSlotHold();
  };

  const startSlotHold = () => {
    setSlotHoldRemaining(HOLD_DURATION_SECONDS);
    setIsSlotHoldActive(true);
  };

  const releaseSlotHold = () => {
    setIsSlotHoldActive(false);
    setSlotHoldRemaining(HOLD_DURATION_SECONDS);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const validateAbuse = (): { valid: boolean; message?: string } => {
    // Abuse Safeguard Logic: check for multiple active bookings, slot spams, etc.
    // For Mock-first: we scan if notes contain suspicious keywords or spams
    if (userNote.toLowerCase().includes('spam') || userNote.length > 500) {
      return {
        valid: false,
        message: 'Suspicious request activity detected. Please review your booking details or contact the receptionist.',
      };
    }
    return { valid: true };
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    releaseSlotHold();
    setPatientType('SELF');
    setSelectedDependentId(null);
    setNewDependentData(null);
    setUserNote('');
    setTermsAccepted(false);
    setPrivacyAccepted(false);
  };

  return {
    currentStep,
    selectedService,
    selectedDate,
    selectedSlot,
    slotHoldRemaining,
    isSlotHoldActive,
    patientType,
    selectedDependentId,
    newDependentData,
    userNote,
    termsAccepted,
    privacyAccepted,

    nextStep,
    prevStep,
    goToStep,
    selectService,
    selectDate,
    selectSlot,
    startSlotHold,
    releaseSlotHold,
    setPatientType,
    setSelectedDependentId,
    setNewDependentData,
    setUserNote,
    setTermsAccepted,
    setPrivacyAccepted,
    validateAbuse,
    resetWizard,
  };
}
