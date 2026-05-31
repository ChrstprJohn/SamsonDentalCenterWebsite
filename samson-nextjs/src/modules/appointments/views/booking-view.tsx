'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserBooking } from '../hooks/booking/use-user-booking';
import { ServiceStep } from '../components/booking/service-step';
import { DateTimeStep } from '../components/booking/date-time-step';
import { PatientDetailsStep } from '../components/booking/patient-details-step';
import { ReviewStep } from '../components/booking/review-step';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface BookingViewProps {
  services: ServiceResponseDto[];
}

export function BookingView({ services }: BookingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  
  const {
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
  } = useUserBooking();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-select service if passed in query param
  useEffect(() => {
    const serviceId = searchParams.get('service');
    if (serviceId && services.length > 0) {
      const found = services.find((s) => s.id === serviceId);
      if (found) {
        selectService(found);
      }
    }
  }, [searchParams, services]);

  const handleSubmit = async () => {
    if (!termsAccepted || !privacyAccepted) {
      addToast('Please accept both terms and privacy policies.', 'error');
      return;
    }

    // Abuse detection scan
    const abuse = validateAbuse();
    if (!abuse.valid) {
      addToast(abuse.message || 'Suspicious booking activity detected.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate server action submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);

    setIsSuccess(true);
    addToast('Appointment scheduled successfully!', 'success');
  };

  const isNextDisabled = () => {
    if (currentStep === 1 && !selectedService) return true;
    if (currentStep === 2 && (!selectedDate || !selectedSlot)) return true;
    if (currentStep === 3) {
      if (patientType === 'EXISTING_DEPENDENT' && !selectedDependentId) return true;
      if (patientType === 'NEW_DEPENDENT' && !newDependentData) return true;
    }
    return false;
  };

  const steps = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Schedule' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Review' },
  ] as const;

  if (isSuccess) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl text-center flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-3xl text-emerald-600 dark:text-emerald-400">
          ✓
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Booking Confirmed!</h2>
          <p className="text-sm text-slate-500 max-w-md">
            Your appointment has been successfully scheduled. You can view, track, or reschedule this reservation inside your patient dashboard portal.
          </p>
        </div>

        <div className="w-full border border-slate-100 dark:border-white/5 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 text-xs flex flex-col gap-2 text-left">
          <div className="flex justify-between">
            <span className="text-slate-400">Treatment</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Practitioner</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSlot?.doctorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Date & Time</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDate} at {selectedSlot?.time}</span>
          </div>
        </div>

        <Button onClick={() => router.push('/user')} className="mt-2 w-full sm:w-auto">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl flex flex-col gap-8">
      {/* progress tabs */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-150 dark:bg-white/5 -translate-y-1/2 z-0" />
        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;
          return (
            <button
              key={step.num}
              onClick={() => goToStep(step.num)}
              disabled={step.num > currentStep && isNextDisabled()}
              className="flex flex-col items-center gap-2 relative z-10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none group"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : isCompleted
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-400'
              }`}>
                {isCompleted ? '✓' : step.num}
              </div>
              <span className={`text-[10px] md:text-xs font-semibold ${
                isActive ? 'text-blue-550 dark:text-blue-450' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* step views */}
      <div className="flex-1 min-h-[300px]">
        {currentStep === 1 && (
          <ServiceStep
            services={services}
            selectedService={selectedService}
            onSelect={selectService}
          />
        )}
        {currentStep === 2 && (
          <DateTimeStep
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            slotHoldRemaining={slotHoldRemaining}
            isSlotHoldActive={isSlotHoldActive}
            onSelectDate={selectDate}
            onSelectSlot={selectSlot}
          />
        )}
        {currentStep === 3 && (
          <PatientDetailsStep
            patientType={patientType}
            selectedDependentId={selectedDependentId}
            newDependentData={newDependentData}
            userNote={userNote}
            onSetPatientType={setPatientType}
            onSelectDependent={setSelectedDependentId}
            onSetNewDependent={setNewDependentData}
            onSetUserNote={setUserNote}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            service={selectedService}
            date={selectedDate}
            slot={selectedSlot}
            patientType={patientType}
            selectedDependentId={selectedDependentId}
            newDependentData={newDependentData}
            userNote={userNote}
            termsAccepted={termsAccepted}
            privacyAccepted={privacyAccepted}
            onSetTermsAccepted={setTermsAccepted}
            onSetPrivacyAccepted={setPrivacyAccepted}
          />
        )}
      </div>

      {/* footer controls */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-6 mt-4">
        <Button
          variant="secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            disabled={isNextDisabled()}
          >
            Next Step
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !termsAccepted || !privacyAccepted}
          >
            {isSubmitting ? 'Finalizing...' : 'Submit Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}
