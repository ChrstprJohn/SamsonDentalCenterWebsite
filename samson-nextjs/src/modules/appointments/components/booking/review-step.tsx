'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingSlot, NewDependentInput } from '../../hooks/booking/use-user-booking';
import { formatShortDate, formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';

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
  onEditStep?: (step: 1 | 2 | 3 | 4) => void;
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
  onEditStep,
}: ReviewStepProps) {
  const getPatientName = () => {
    if (patientType === 'SELF') return 'Myself (Self)';
    if (patientType === 'NEW_DEPENDENT' && newDependentData) {
      return `${[newDependentData.firstName, newDependentData.middleName, newDependentData.lastName, newDependentData.suffix].filter(Boolean).join(' ')} (${newDependentData.relationship})`;
    }
    if (patientType === 'EXISTING_DEPENDENT') {
      return selectedDependentId === 'dep-1' ? 'Jane Samson (Spouse)' : 'Timmy Samson (Child)';
    }
    return 'Patient';
  };

  const getSlotRange = () => {
    if (!date || !slot || !service) return '';
    const start = new Date(slot.originalStartTime);
    const end = calculateEndTimeFromIso(slot.originalStartTime, service.durationMinutes);
    return `${formatClinicTime(start)} - ${formatClinicTime(end)}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Booking Details</h3>
        <p className="text-sm text-slate-500">Confirm the scheduling parameters before finalizing submission.</p>
      </div>

      {/* Service Details Section */}
      <div className="border border-slate-200 dark:border-white/5 rounded-3xl p-5 bg-white dark:bg-slate-900/40 relative shadow-sm">
        {onEditStep && (
          <button 
            onClick={() => onEditStep(1)}
            className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">1. Service Details</h4>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{service?.name}</span>
          {service?.description && <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
              ⏱ {service?.durationMinutes} mins
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              💰 {service?.price !== null ? `$${service?.price}` : 'Pricing TBD'}
            </span>
          </div>
        </div>
      </div>

      {/* Appointment Details Section */}
      <div className="border border-slate-200 dark:border-white/5 rounded-3xl p-5 bg-white dark:bg-slate-900/40 relative shadow-sm">
        {onEditStep && (
          <button 
            onClick={() => onEditStep(2)}
            className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">2. Date & Time</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Appointment Date</span>
            <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">📅 {date ? formatShortDate(date) : ''}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Time Range</span>
            <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">⏰ {getSlotRange()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Assigned Practitioner</span>
            <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">👨‍⚕️ {slot?.doctorName}</span>
          </div>
        </div>
      </div>

      {/* Patient Details Section */}
      <div className="border border-slate-200 dark:border-white/5 rounded-3xl p-5 bg-white dark:bg-slate-900/40 relative shadow-sm">
        {onEditStep && (
          <button 
            onClick={() => onEditStep(3)}
            className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">3. Patient Info</h4>
        
        <div className="flex flex-col gap-1 mb-4">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Patient Recipient</span>
          <span className="font-bold text-slate-800 dark:text-slate-250 text-sm">
            👤 {getPatientName()}
          </span>
        </div>

        {userNote && (
          <div className="flex flex-col gap-1 pt-5 border-t border-slate-100 dark:border-white/5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Clinical Notes</span>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              "{userNote}"
            </p>
          </div>
        )}
      </div>

      {/* Consent Checkboxes */}
      <div className="flex flex-col gap-3 mt-4">
        <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer group">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onSetTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
            I agree to the Samson Dental{' '}
            <a href="/terms" target="_blank" className="text-blue-500 hover:text-blue-600 hover:underline font-semibold">
              Terms of Service
            </a>{' '}
            and cancellation policies.
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 cursor-pointer group">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => onSetPrivacyAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
            I authorize Samson Dental to secure my personal health history records under the{' '}
            <a href="/privacy" target="_blank" className="text-blue-500 hover:text-blue-600 hover:underline font-semibold">
              Privacy Policy
            </a>.
          </span>
        </label>
      </div>
    </div>
  );
}
