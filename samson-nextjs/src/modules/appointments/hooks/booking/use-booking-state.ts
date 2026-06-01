import { useState, useRef, useEffect } from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingStep, BookingSlot, NewDependentInput } from './use-user-booking';

const HOLD_DURATION_SECONDS = 600; // 10 minutes

export function useBookingState() {
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

  const releaseSlotHold = () => {
    setIsSlotHoldActive(false);
    setSlotHoldRemaining(HOLD_DURATION_SECONDS);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const startSlotHold = () => {
    setSlotHoldRemaining(HOLD_DURATION_SECONDS);
    setIsSlotHoldActive(true);
  };

  const resetState = () => {
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
    currentStep, setCurrentStep,
    selectedService, setSelectedService,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    slotHoldRemaining,
    isSlotHoldActive,
    patientType, setPatientType,
    selectedDependentId, setSelectedDependentId,
    newDependentData, setNewDependentData,
    userNote, setUserNote,
    termsAccepted, setTermsAccepted,
    privacyAccepted, setPrivacyAccepted,
    startSlotHold,
    releaseSlotHold,
    resetState,
  };
}
