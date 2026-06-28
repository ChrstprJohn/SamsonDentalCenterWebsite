'use client';

import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';

interface RescheduleRequestSummaryProps {
  appointment: any;
  patientDetails: any;
  getDoctorName: (doctorId: string | null) => string;
}

export function RescheduleRequestSummary({ appointment, patientDetails, getDoctorName }: RescheduleRequestSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <PatientProfile appointment={appointment} patientDetails={patientDetails} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AppointmentBlock
          tone="muted"
          title="Original Appointment"
          rows={[
            ['Date', formatShortDate(appointment.date)],
            ['Time', `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`],
            ['Dentist', appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'No doctor'],
          ]}
        />
        <AppointmentBlock
          tone="primary"
          title="Proposed Reschedule"
          rows={[
            ['Proposed Date', appointment.proposedDate ? formatShortDate(appointment.proposedDate) : 'Not specified'],
            ['Proposed Time', appointment.proposedStartTime ? `${formatClinicTime(appointment.proposedStartTime)} - ${formatClinicTime(appointment.proposedEndTime)}` : 'Not specified'],
            ['Proposed Dentist', getDoctorName(appointment.proposedDoctorId)],
          ]}
        />
      </div>
      {appointment.statusReason && (
        <div className="bg-secondary-bg/40 border border-card-border/60 rounded-xl p-3 text-xs text-text-secondary leading-relaxed">
          <div className="font-bold text-[10px] uppercase text-text-muted mb-1">Patient Reason for Reschedule</div>
          &quot;{appointment.statusReason}&quot;
        </div>
      )}
    </div>
  );
}

function PatientProfile({ appointment, patientDetails }: { appointment: any; patientDetails: any }) {
  return (
    <div className="border-b border-card-border pb-4">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-secondary-bg flex items-center justify-center font-bold text-text-secondary text-sm">
          {(patientDetails?.profile?.firstName?.[0] || 'P') + (patientDetails?.profile?.lastName?.[0] || '')}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted font-medium">Account Owner</span>
          <h3 className="text-sm font-black text-text-primary">
            {patientDetails?.profile?.firstName} {patientDetails?.profile?.lastName}
          </h3>
          <span className="text-[10px] text-text-secondary">
            {patientDetails?.profile?.email} | {patientDetails?.profile?.phoneNumber}
          </span>
        </div>
      </div>
      {appointment.dependent && (
        <div className="bg-secondary-bg/20 border border-card-border/60 rounded-2xl p-3 flex flex-col gap-1 mt-3 text-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted">Actual Patient (Dependent)</span>
          <div className="font-semibold text-text-primary">{appointment.dependent.firstName} {appointment.dependent.lastName}</div>
          <div className="text-[10px] text-text-secondary uppercase">Relationship: {appointment.dependent.relationship}</div>
        </div>
      )}
    </div>
  );
}

function AppointmentBlock({ title, rows, tone }: { title: string; rows: string[][]; tone: 'muted' | 'primary' }) {
  const primary = tone === 'primary';
  return (
    <div className={`border rounded-2xl p-4 flex flex-col gap-2 ${primary ? 'border-primary/30 bg-primary/5' : 'border-card-border/60 bg-secondary-bg/5'}`}>
      <div className={`text-[10px] font-bold uppercase tracking-wider ${primary ? 'text-primary' : 'text-text-muted'}`}>{title}</div>
      <div className="flex flex-col text-xs gap-1">
        {rows.map(([label, value]) => (
          <span key={label} className="text-text-secondary">
            {label}: <strong className={primary ? 'text-primary' : 'text-text-primary'}>{value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
