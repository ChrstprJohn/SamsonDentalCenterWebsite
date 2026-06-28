'use client';

import React from 'react';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import type { BookingSlot, NewDependentInput } from '../../hooks/booking/use-user-booking';
import { formatClinicTime, calculateEndTimeFromIso } from '@/shared/utils/date.util';
import { ReviewPatientDetails } from './sub-components/review-patient-details';
import { ReviewServiceDetails } from './sub-components/review-service-details';
import { ReviewAppointmentDetails } from './sub-components/review-appointment-details';
import { ReviewContactDetails } from './sub-components/review-contact-details';

interface ReviewStepProps {
  service: ServiceResponseDto | null;
  date: string | null;
  slot: BookingSlot | null;
  patientType: 'SELF' | 'EXISTING_DEPENDENT' | 'NEW_DEPENDENT';
  selectedDependentId: string | null;
  newDependentData: NewDependentInput | null;
  userNote: string;
  onEditStep?: (step: 1 | 2 | 3 | 4) => void;
  userProfile?: any;
  userDependents?: any[];
}

export function ReviewStep({
  service,
  date,
  slot,
  patientType,
  selectedDependentId,
  newDependentData,
  userNote,
  onEditStep,
  userProfile,
  userDependents,
}: ReviewStepProps) {
  const getSlotRange = () => {
    if (!date || !slot || !service) return '';
    const start = new Date(slot.originalStartTime);
    const end = calculateEndTimeFromIso(slot.originalStartTime, service.durationMinutes);
    return `${formatClinicTime(start)} - ${formatClinicTime(end)}`;
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-1 mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Booking Details</h3>
        <p className="text-sm text-slate-500">Confirm the scheduling parameters before finalizing submission.</p>
      </div>

      <ReviewServiceDetails service={service} onEditStep={onEditStep} />

      <ReviewAppointmentDetails date={date} slot={slot} onEditStep={onEditStep} getSlotRange={getSlotRange} />

      {/* Patient Details Section */}
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300">
        {onEditStep && (
          <button
            onClick={() => onEditStep(3)}
            className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
          >
            Edit
          </button>
        )}
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          3. Patient Info
        </h4>

        <ReviewPatientDetails
          patientType={patientType}
          selectedDependentId={selectedDependentId}
          newDependentData={newDependentData}
          userProfile={userProfile}
          userDependents={userDependents}
        />

        {userNote && (
          <div className="flex flex-col gap-1 pt-5 border-t border-slate-200 dark:border-white/5 mt-4">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
              Clinical Notes
            </span>
            <p className="text-sm text-slate-650 dark:text-slate-450 italic leading-relaxed bg-slate-500/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
              "{userNote}"
            </p>
          </div>
        )}
      </div>

      <ReviewContactDetails userProfile={userProfile} />
    </div>
  );
}
