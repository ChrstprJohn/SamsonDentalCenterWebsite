'use client';

import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';

export function PendingRequestOverview({ appointment, patientDetails, conflictingAppointment }: { appointment: any; patientDetails: any; conflictingAppointment: any }) {
  return (
    <div className="flex flex-col gap-4">
      {conflictingAppointment && <ConflictBanner conflictingAppointment={conflictingAppointment} />}
      <PatientIdentity appointment={appointment} patientDetails={patientDetails} />
      <RequestFacts appointment={appointment} patientDetails={patientDetails} />
      {appointment.userNote && (
        <div className="bg-secondary-bg/40 border border-card-border/60 rounded-xl p-3 text-xs text-text-secondary leading-relaxed">
          <div className="font-bold text-[10px] uppercase text-text-muted mb-1">Appointment Request Note</div>
          &quot;{appointment.userNote}&quot;
        </div>
      )}
      <ReliabilityCounters reliability={patientDetails?.reliability} />
      <PatientHistory history={patientDetails?.history || []} />
    </div>
  );
}

function ConflictBanner({ conflictingAppointment }: { conflictingAppointment: any }) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 text-xs leading-relaxed text-rose-600 dark:text-rose-450">
      <strong className="font-black uppercase tracking-wider block mb-0.5">Booking Conflict Detected</strong>
      This patient already has an active appointment for <span className="font-bold underline">{conflictingAppointment.service?.name || 'treatment'}</span> scheduled at the same time: <span className="font-bold">{formatClinicTime(conflictingAppointment.startTime)} - {formatClinicTime(conflictingAppointment.endTime)}</span>.
    </div>
  );
}

function PatientIdentity({ appointment, patientDetails }: { appointment: any; patientDetails: any }) {
  return (
    <div className="border-b border-card-border pb-4">
      <div className="flex gap-4 items-center mb-3">
        {patientDetails?.profile.avatarUrl ? (
          <img src={patientDetails.profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-card-border object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-secondary-bg flex items-center justify-center font-bold text-text-secondary text-sm">
            {(patientDetails?.profile.firstName?.[0] || 'P') + (patientDetails?.profile.lastName?.[0] || '')}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-text-muted font-medium">Account Owner</span>
          <h3 className="text-sm font-black text-text-primary">{patientDetails?.profile.firstName} {patientDetails?.profile.lastName}</h3>
          <span className="text-[10px] text-text-secondary">{patientDetails?.profile.email} | {patientDetails?.profile.phoneNumber}</span>
        </div>
      </div>
      {appointment.dependent && (
        <div className="bg-secondary-bg/20 border border-card-border/60 rounded-2xl p-3 flex flex-col gap-1 mt-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-text-muted">Actual Patient (Dependent)</span>
          <div className="font-semibold text-text-primary">{appointment.dependent.firstName} {appointment.dependent.lastName}</div>
          <div className="text-[10px] text-text-secondary uppercase">Relationship: {appointment.dependent.relationship}</div>
        </div>
      )}
    </div>
  );
}

function RequestFacts({ appointment, patientDetails }: { appointment: any; patientDetails: any }) {
  const dentist = appointment.doctor ? `${appointment.doctor.prefix || 'Dr.'} ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'No doctor assigned';
  const birthday = appointment.dependent?.dateOfBirth || patientDetails?.profile.dateOfBirth;
  return (
    <div className="grid grid-cols-2 gap-3 text-xs border-b border-card-border pb-3">
      <Fact label="Requested Service" value={appointment.service?.name} />
      <Fact label="Requested Dentist" value={dentist} />
      <Fact label="Desired Date & Time" value={`${formatShortDate(appointment.date)} | ${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`} />
      {birthday && <Fact label="Patient Date of Birth" value={formatShortDate(birthday)} />}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col"><span className="text-text-muted font-medium">{label}</span><span className="text-text-primary font-semibold">{value}</span></div>;
}

function ReliabilityCounters({ reliability }: { reliability: any }) {
  const items = [
    ['Completed', reliability?.completedCount || 0],
    ['Cancellations', reliability?.cancelCount || 0],
    ['No-Shows', reliability?.noShowCount || 0],
    ['Reschedules', reliability?.rescheduleCount || 0],
  ];
  return (
    <div className="border border-card-border/40 rounded-xl p-3 bg-secondary-bg/10 flex justify-around text-center text-xs">
      {items.map(([label, value], index) => (
        <div key={label} className={index === 0 ? '' : 'border-l border-card-border/50 pl-4'}>
          <span className="block font-bold text-text-primary">{value}</span>
          <span className="text-[10px] text-text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}

function PatientHistory({ history }: { history: any[] }) {
  return (
    <div className="border border-card-border/45 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2.5">
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Patient Past History (Latest 5)</div>
      <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
        {history.length > 0 ? history.map((item) => <HistoryRow key={item.id} item={item} />) : <span className="text-xs text-text-muted text-center py-4">No past history found.</span>}
      </div>
    </div>
  );
}

function HistoryRow({ item }: { item: any }) {
  const tone = item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : item.status === 'CANCELLED' || item.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500';
  return (
    <div className="flex justify-between items-center text-xs p-2 rounded-lg border border-card-border/40 bg-card">
      <div className="flex flex-col">
        <span className="font-semibold text-text-primary">{formatShortDate(item.date)} | {formatClinicTime(item.startTime)} - {formatClinicTime(item.endTime)}</span>
        <span className="text-[10px] text-text-secondary">{item.service?.name}</span>
      </div>
      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${tone}`}>{item.status}</span>
    </div>
  );
}
