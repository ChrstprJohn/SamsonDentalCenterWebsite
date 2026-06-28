'use client';

import { CLINIC_HOURS } from '@/modules/staff/hooks/secretary/use-secretary-reschedule-requests';
import { formatClinicTime } from '@/shared/utils/date.util';

interface RescheduleDoctorScheduleProps {
  appointment: any;
  doctorSchedule: any[];
  getDoctorName: (doctorId: string | null) => string;
}

export function RescheduleDoctorSchedule({ appointment, doctorSchedule, getDoctorName }: RescheduleDoctorScheduleProps) {
  return (
    <div className="border border-card-border/60 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-3">
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex justify-between">
        <span>Dentist Schedule ({getDoctorName(appointment.proposedDoctorId || appointment.doctorId)})</span>
        <span className="text-[9px] text-primary font-bold">{appointment.proposedDate || appointment.date}</span>
      </div>
      <div className="relative pl-6 flex flex-col gap-3 max-h-[160px] overflow-y-auto pr-1">
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-card-border/60" />
        {CLINIC_HOURS.map((hour) => {
          const matchedAppointment = doctorSchedule.find((scheduled) => formatClinicTime(scheduled.startTime) === hour);
          return matchedAppointment ? (
            <BookedSlot key={hour} hour={hour} appointment={appointment} matchedAppointment={matchedAppointment} />
          ) : (
            <OpenSlot key={hour} hour={hour} appointment={appointment} />
          );
        })}
      </div>
    </div>
  );
}

function BookedSlot({ hour, appointment, matchedAppointment }: { hour: string; appointment: any; matchedAppointment: any }) {
  const isCurrentProposal = appointment.proposedStartTime && formatClinicTime(appointment.proposedStartTime) === hour;
  const patientLabel = matchedAppointment.dependent
    ? `${matchedAppointment.dependent.firstName} ${matchedAppointment.dependent.lastName}`
    : matchedAppointment.patient
      ? `${matchedAppointment.patient.firstName} ${matchedAppointment.patient.lastName}`
      : 'Guest';

  return (
    <div className="relative flex flex-col">
      <div className={`absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 ${isCurrentProposal ? 'bg-primary border-white ring-2 ring-primary/35' : 'bg-text-secondary border-card'}`} />
      <div className={`p-2.5 px-3.5 rounded-xl text-[11px] border flex justify-between items-center transition-all ${isCurrentProposal ? 'bg-primary text-white border-primary font-black shadow-md scale-[1.01]' : 'bg-secondary-bg/25 border-card-border/40 text-text-secondary opacity-75'}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold">{hour}</span>
          <span className={isCurrentProposal ? 'text-white font-bold' : 'text-text-primary font-semibold'}>
            {isCurrentProposal ? 'PROPOSED SLOT' : patientLabel}
          </span>
        </div>
        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${isCurrentProposal ? 'bg-white/20 text-white' : matchedAppointment.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-500 border border-amber-500/25'}`}>
          {isCurrentProposal ? 'PROPOSED' : matchedAppointment.status}
        </span>
      </div>
    </div>
  );
}

function OpenSlot({ hour, appointment }: { hour: string; appointment: any }) {
  const isCurrentProposal = appointment.proposedStartTime && formatClinicTime(appointment.proposedStartTime) === hour;
  return (
    <div className="relative flex flex-col">
      <div className="absolute left-[-20px] top-[14px] w-2.5 h-2.5 rounded-full border-2 bg-emerald-500 border-card" />
      <div className={`p-2.5 px-3.5 rounded-xl text-[11px] border border-dashed border-card-border/60 bg-card flex justify-between items-center text-text-muted transition-colors hover:bg-secondary-bg/10 ${isCurrentProposal ? 'ring-2 ring-primary/40 border-solid border-primary' : ''}`}>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold">{hour}</span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">Free / Available</span>
        </div>
        <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">OPEN</span>
      </div>
    </div>
  );
}
