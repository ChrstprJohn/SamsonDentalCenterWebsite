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
  const renderPatientDetails = () => {
    if (patientType === 'SELF') {
      return (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-xs flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">👤 Myself (Self)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">First Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.firstName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Middle Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.middleName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Last Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.lastName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Suffix</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{userProfile?.suffix || 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Date of Birth</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{userProfile?.dateOfBirth ? formatShortDate(userProfile.dateOfBirth) : 'N/A'}</span>
            </div>
          </div>
        </div>
      );
    }
    if (patientType === 'NEW_DEPENDENT' && newDependentData) {
      return (
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">👤 New Family Member</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">First Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.firstName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Middle Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.middleName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Last Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.lastName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Suffix</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{newDependentData.suffix || 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Date of Birth</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{newDependentData.birthday ? formatShortDate(newDependentData.birthday) : 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Relationship</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{newDependentData.relationship}</span>
            </div>
          </div>
        </div>
      );
    }
    if (patientType === 'EXISTING_DEPENDENT') {
      const dep = userDependents?.find((d) => d.id === selectedDependentId);
      if (dep) {
        return (
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-card/50 dark:bg-slate-900/30 text-xs flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">👤 Existing Family Member</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">First Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.firstName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Middle Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.middleName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Last Name</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.lastName || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Suffix</span>
               <span className="text-slate-700 dark:text-slate-300 font-semibold">{dep.suffix || 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-slate-200 dark:border-white/5">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Date of Birth</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{dep.dateOfBirth ? formatShortDate(dep.dateOfBirth) : 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Relationship</span>
               <span className="text-slate-600 dark:text-slate-300 font-medium">{dep.relationship}</span>
            </div>
          </div>
        </div>
        );
      }
    }
    return <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">👤 Patient</span>;
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
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300">
        {onEditStep && (
          <button 
            onClick={() => onEditStep(1)}
            className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">1. Service Details</h4>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{service?.name}</span>
          {service?.description && <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
              ⏱ {service?.durationMinutes} mins
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
              💰 {service?.price !== null ? `$${service?.price}` : 'Pricing TBD'}
            </span>
          </div>
        </div>
      </div>

      {/* Appointment Details Section */}
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300">
        {onEditStep && (
          <button 
            onClick={() => onEditStep(2)}
            className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">2. Date & Time</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Appointment Date</span>
            <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">📅 {date ? formatShortDate(date) : ''}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Time Range</span>
            <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">⏰ {getSlotRange()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Assigned Practitioner</span>
            <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">👨‍⚕️ {slot?.doctorName}</span>
          </div>
        </div>
      </div>

      {/* Patient Details Section */}
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300">
        {onEditStep && (
          <button 
            onClick={() => onEditStep(3)}
            className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">3. Patient Info</h4>
        
        {renderPatientDetails()}

        {userNote && (
          <div className="flex flex-col gap-1 pt-5 border-t border-slate-200 dark:border-white/5 mt-4">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Clinical Notes</span>
            <p className="text-sm text-slate-650 dark:text-slate-450 italic leading-relaxed bg-slate-500/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
              "{userNote}"
            </p>
          </div>
        )}
      </div>

      {/* Contact Details Section */}
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">4. Contact Details</h4>
        <div className="flex flex-col sm:flex-row gap-8 mb-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Email Address</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm">📧 {userProfile?.email || 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Phone Number</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm">📱 {userProfile?.phoneNumber || 'N/A'}</span>
          </div>
        </div>
        <div className="bg-blue-555/5 p-3 rounded-xl border border-blue-500/10 flex items-start gap-3">
          <span className="text-blue-500 text-lg leading-none mt-0.5">ℹ️</span>
          <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300 font-medium">
            All booking confirmations, appointment reminders, and clinical updates will be securely sent to these primary contact details.
          </p>
        </div>
      </div>
    </div>
  );
}
