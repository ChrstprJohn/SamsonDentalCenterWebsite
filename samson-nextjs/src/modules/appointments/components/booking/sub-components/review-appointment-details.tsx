import React from 'react';
import type { BookingSlot } from '../../../hooks/booking/use-user-booking';
import { formatShortDate } from '@/shared/utils/date.util';

interface ReviewAppointmentDetailsProps {
  date: string | null;
  timePreference: 'MORNING' | 'AFTERNOON';
  selectedDoctorId: string;
  doctors?: any[];
  onEditStep?: (step: 1 | 2 | 3 | 4) => void;
}

export function ReviewAppointmentDetails({
  date,
  timePreference,
  selectedDoctorId,
  doctors = [],
  onEditStep,
}: ReviewAppointmentDetailsProps) {
  const selectedDoc = doctors.find((d) => d.id === selectedDoctorId);
  const doctorName = selectedDoctorId === 'ANY' || !selectedDoc
    ? 'Any Available Doctor (Secretary will assign)'
    : `Dr. ${selectedDoc.firstName} ${selectedDoc.lastName}`;
  const preferenceLabel = timePreference === 'MORNING' ? 'Morning (09:00 AM - 12:00 PM)' : 'Afternoon (01:00 PM - 05:00 PM)';

  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-card/50 dark:bg-slate-900/30 relative shadow-sm hover:scale-[1.01] transition-all duration-300 text-left">
      {onEditStep && (
        <button
          onClick={() => onEditStep(2)}
          className="absolute top-5 right-5 text-xs font-bold text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
        >
          Edit
        </button>
      )}
      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-4">2. Date & Time</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Appointment Date</span>
          <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">📅 {date ? formatShortDate(date) : ''}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Preferred Time</span>
          <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">⏰ {preferenceLabel}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Preferred Practitioner</span>
          <span className="font-bold text-slate-800 dark:text-slate-300 text-sm">👨‍⚕️ {doctorName}</span>
        </div>
      </div>
    </div>
  );
}
