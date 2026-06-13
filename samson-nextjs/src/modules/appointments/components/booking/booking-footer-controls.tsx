'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface BookingFooterControlsProps {
  currentStep: number;
  isNextDisabled: () => boolean;
  isSubmitting: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  prevStep: () => void;
  nextStep: () => void;
  handleSubmit: () => void;
}

export function BookingFooterControls({
  currentStep,
  isNextDisabled,
  isSubmitting,
  termsAccepted,
  privacyAccepted,
  prevStep,
  nextStep,
  handleSubmit,
}: BookingFooterControlsProps) {
  return (
    <div className="flex items-center justify-between border-t border-card-border pt-6 mt-4">
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
  );
}
