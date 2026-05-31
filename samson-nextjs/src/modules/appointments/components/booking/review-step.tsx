'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingSlot, NewDependentInput } from '../../hooks/booking/use-user-booking';

interface ReviewStepProps {
  service: ServiceResponseDto | null;
  date: string | null;
  slot: BookingSlot | null;
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  onSetTermsAccepted: (accepted: boolean) => void;
  onSetPrivacyAccepted: (accepted: boolean) => void;
}

export function ReviewStep({
  service,
  date,
  slot,
  patientType,
  selectedDependentId,
  newDependentData,
  userNote,
  termsAccepted,
  privacyAccepted,
  onSetTermsAccepted,
  onSetPrivacyAccepted,
}: ReviewStepProps) {
  const getPatientName = () => {
    if (patientType === 'SELF') return 'Myself (Self)';
    if (patientType === 'NEW_DEPENDENT' && newDependentData) {
      return `${newDependentData.firstName} ${newDependentData.lastName} (${newDependentData.relationship})`;
    }
    if (patientType === 'EXISTING_DEPENDENT') {
      return selectedDependentId === 'dep-1' ? 'Jane Samson (Spouse)' : 'Timmy Samson (Child)';
    }
    return 'Patient';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Booking Details</h3>
        <p className="text-xs text-slate-500">Confirm the scheduling parameters before finalizing submission.</p>
      </div>

      {/* Summary grid */}
      <div className="border border-slate-200 dark:border-white/5 rounded-3xl p-5 md:p-6 bg-slate-50/50 dark:bg-slate-900/40 text-xs flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/80 dark:border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Service Type</span>
            <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">{service?.name}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Price</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
              {service?.price !== null ? `$${service?.price}` : 'Pricing TBD'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/80 dark:border-white/5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Reserved Time Slot</span>
            <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">
              📅 {date} at {slot?.time}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Assigned Practitioner</span>
            <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">
              {slot?.doctorName}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Patient Recipient</span>
          <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">
            👤 {getPatientName()}
          </span>
        </div>

        {userNote && (
          <div className="flex flex-col gap-0.5 border-t border-slate-200/80 dark:border-white/5 pt-3 mt-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Clinical Notes</span>
            <p className="text-slate-600 dark:text-slate-450 italic mt-0.5 leading-relaxed">{userNote}</p>
          </div>
        )}
      </div>

      {/* Consent Checkboxes */}
      <div className="flex flex-col gap-3 mt-2">
        <label className="flex items-start gap-3 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onSetTermsAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I agree to the Samson Dental{' '}
            <a href="/terms" target="_blank" className="text-blue-500 hover:underline font-semibold">
              Terms of Service
            </a>{' '}
            and cancellation policies.
          </span>
        </label>

        <label className="flex items-start gap-3 text-xs text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => onSetPrivacyAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I authorize Samson Dental to secure my personal health history records under the{' '}
            <a href="/privacy" target="_blank" className="text-blue-500 hover:underline font-semibold">
              Privacy Policy
            </a>.
          </span>
        </label>
      </div>
    </div>
  );
}
