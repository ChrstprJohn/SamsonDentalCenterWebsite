'use client';

import { PENDING_CLINIC_HOURS } from '@/modules/staff/hooks/secretary/use-secretary-pending-requests';
import { formatClinicTime } from '@/shared/utils/date.util';

export function PendingDoctorSchedule({ appointment, doctorSchedule }: { appointment: any; doctorSchedule: any[] }) {
  const doctorName = appointment.doctor ? `${appointment.doctor.prefix || 'Dr.'} ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'Doctor';
  return (
    <div className="border border-card-border/60 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-3">
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex justify-between">
        <span>Doctor Schedule ({doctorName})</span>
        <span className="text-[9px] text-primary-start font-bold">{appointment.date}</span>
      </div>
      <div className="relative pl-6 flex flex-col gap-3 max-h-[180px] overflow-y-auto pr-1">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-card-border/60" />
        {PENDING_CLINIC_HOURS.map((hour) => {
          const matchedAppointment = doctorSchedule.find((scheduled) => formatClinicTime(scheduled.startTime) === hour);
          return matchedAppointment
            ? <BookedDoctorSlot key={hour} hour={hour} selectedAppointment={appointment} appointment={matchedAppointment} />
            : <OpenDoctorSlot key={hour} hour={hour} />;
        })}
      </div>
    </div>
  );
}

function BookedDoctorSlot({ hour, selectedAppointment, appointment }: { hour: string; selectedAppointment: any; appointment: any }) {
  const isCurrent = appointment.id === selectedAppointment.id;
  const patientLabel = appointment.dependent
    ? `${appointment.dependent.firstName} ${appointment.dependent.lastName}`
    : appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Guest';
  return (
    <div className="relative flex flex-col">
      <div className={`absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 ${isCurrent ? 'bg-primary-start border-white ring-2 ring-primary-start/35' : 'bg-text-secondary border-card'}`} />
      <div className={`p-2.5 px-3.5 rounded-xl text-[11px] border flex justify-between items-center transition-all ${isCurrent ? 'bg-primary-start text-white border-primary-start font-black shadow-md scale-[1.01]' : 'bg-secondary-bg/25 border-card-border/40 text-text-secondary opacity-75'}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold">{hour}</span>
          <span className={isCurrent ? 'text-white font-bold' : 'text-text-primary font-semibold'}>{isCurrent ? 'CURRENT REQUEST' : patientLabel}</span>
        </div>
        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${isCurrent ? 'bg-white/20 text-white' : appointment.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'}`}>
          {isCurrent ? 'REQUESTED' : appointment.status}
        </span>
      </div>
    </div>
  );
}

function OpenDoctorSlot({ hour }: { hour: string }) {
  return (
    <div className="relative flex flex-col">
      <div className="absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 bg-emerald-500 border-card" />
      <div className="p-2.5 px-3.5 rounded-xl text-[11px] border border-dashed border-card-border/60 bg-card flex justify-between items-center text-text-muted transition-colors hover:bg-secondary-bg/10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold">{hour}</span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">Free / Available</span>
        </div>
        <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">OPEN</span>
      </div>
    </div>
  );
}
