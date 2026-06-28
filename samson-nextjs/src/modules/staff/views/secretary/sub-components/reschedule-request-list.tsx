'use client';

import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';

interface RescheduleRequestListProps {
  appointments: any[];
  selectedAppointmentId: string | null;
  isLoading: boolean;
  onSelect: (appointmentId: string) => void;
}

export function RescheduleRequestList(props: RescheduleRequestListProps) {
  return (
    <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
      <div className="text-sm font-bold text-text-primary mb-3">Pending Reschedules ({props.appointments.length})</div>
      {props.isLoading ? (
        <div className="py-12 text-center text-text-muted text-xs">Loading reschedule requests...</div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                <th className="py-3 px-2">Patient</th>
                <th className="py-3 px-2">Service</th>
                <th className="py-3 px-2">Proposed Time</th>
              </tr>
            </thead>
            <tbody>
              {props.appointments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-text-muted">No pending reschedule requests.</td>
                </tr>
              ) : (
                props.appointments.map((appointment) => (
                  <RescheduleRequestRow
                    key={appointment.id}
                    appointment={appointment}
                    isSelected={props.selectedAppointmentId === appointment.id}
                    onSelect={props.onSelect}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RescheduleRequestRow({ appointment, isSelected, onSelect }: { appointment: any; isSelected: boolean; onSelect: (id: string) => void }) {
  const patientName = appointment.dependent
    ? `${appointment.dependent.firstName} ${appointment.dependent.lastName}`
    : appointment.patient
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : 'Guest';

  return (
    <tr
      onClick={() => onSelect(appointment.id)}
      className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${isSelected ? 'bg-secondary-bg/50' : ''}`}
    >
      <td className="py-3.5 px-2 font-semibold text-text-primary">{patientName}</td>
      <td className="py-3.5 px-2 text-text-secondary">{appointment.service?.name}</td>
      <td className="py-3.5 px-2 text-rose-500 font-bold">
        {appointment.proposedDate ? `${formatShortDate(appointment.proposedDate)} | ${formatClinicTime(appointment.proposedStartTime)}` : 'No proposal'}
      </td>
    </tr>
  );
}
