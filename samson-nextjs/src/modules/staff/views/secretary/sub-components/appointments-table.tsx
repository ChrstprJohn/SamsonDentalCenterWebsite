'use client';

import { Badge } from '@/components/ui/badge';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';

interface AppointmentsTableProps {
  appointments: AppointmentDto[];
  selectedAppointmentId: string | null;
  isLoading: boolean;
  formatPatientName: (appointment: AppointmentDto) => string;
  onSelect: (appointmentId: string) => void;
}

export function AppointmentsTable(props: AppointmentsTableProps) {
  return (
    <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col min-h-[40vh]">
      {props.isLoading ? (
        <div className="flex-1 flex items-center justify-center text-xs text-text-muted">Loading appointments...</div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                <th className="py-3 px-2">Patient</th><th className="py-3 px-2">Service</th><th className="py-3 px-2">Doctor</th><th className="py-3 px-2">Date & Time</th><th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {props.appointments.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-muted">No matching appointments found.</td></tr>
              ) : (
                props.appointments.map((appointment) => <AppointmentRow key={appointment.id} appointment={appointment} isSelected={props.selectedAppointmentId === appointment.id} formatPatientName={props.formatPatientName} onSelect={props.onSelect} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppointmentRow({ appointment, isSelected, formatPatientName, onSelect }: { appointment: AppointmentDto; isSelected: boolean; formatPatientName: (appointment: AppointmentDto) => string; onSelect: (id: string) => void }) {
  return (
    <tr onClick={() => onSelect(appointment.id)} className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${isSelected ? 'bg-secondary-bg/50' : ''}`}>
      <td className="py-3.5 px-2 font-semibold text-text-primary">{formatPatientName(appointment)}</td>
      <td className="py-3.5 px-2 text-text-secondary">{appointment.service?.name || '-'}</td>
      <td className="py-3.5 px-2 text-text-muted">{appointment.doctor ? `Dr. ${appointment.doctor.lastName}` : '-'}</td>
      <td className="py-3.5 px-2 text-text-muted text-[11px]">{formatShortDate(appointment.date)} | {formatClinicTime(appointment.startTime)} - {formatClinicTime(appointment.endTime)}</td>
      <td className="py-3.5 px-2"><Badge variant={getBadgeVariant(appointment.status)}>{appointment.status}</Badge></td>
    </tr>
  );
}

function getBadgeVariant(status: string) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'APPROVED') return 'info';
  if (status === 'NO_SHOW' || status === 'DISPLACED') return 'warning';
  return 'error';
}
