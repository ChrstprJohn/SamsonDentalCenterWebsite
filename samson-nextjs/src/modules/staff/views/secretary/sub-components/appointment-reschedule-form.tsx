'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AvailableSlotDto } from '@/modules/appointments/dtos/availability/get-available-time-slots.dto';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AvailableDoctorItem } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { formatClinicTime } from '@/shared/utils/date.util';

interface AppointmentRescheduleFormProps {
  appointment: AppointmentDto;
  changeTreatment: boolean;
  services: ServiceResponseDto[];
  serviceId: string;
  isLoadingServices: boolean;
  changeDoctor: boolean;
  doctorId: string;
  doctors: AvailableDoctorItem[];
  isLoadingDoctors: boolean;
  date: string;
  activeServiceId: string;
  activeDoctorId: string;
  startTime: string;
  endTime: string;
  justification: string;
  isSubmitting: boolean;
  onToggleTreatment: () => void;
  onServiceSelect: (serviceId: string) => void;
  onToggleDoctor: () => void;
  onDoctorSelect: (doctorId: string) => void;
  onDateSelect: (date: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onJustificationChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function AppointmentRescheduleForm(props: AppointmentRescheduleFormProps) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); props.onSubmit(); }} className="flex flex-col gap-4 border-t border-card-border/60 pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-text-primary">Reschedule Appointment</h4>
        {props.appointment.doctor && <span className="text-[10px] text-text-muted font-medium bg-secondary-bg/30 px-2 py-0.5 rounded-md border border-card-border/40">Original Doctor: {props.appointment.doctorAssignmentSource === 'SYSTEM' ? 'System' : 'Patient'}</span>}
      </div>
      
      <LockRow label={props.changeTreatment ? 'Treatment unlocked - select new service' : props.appointment.service?.name ?? 'Current Service'} action={props.changeTreatment ? 'Keep Original' : 'Change Treatment'} onClick={props.onToggleTreatment} />
      {props.changeTreatment && <ServiceSelector services={props.services} selectedId={props.serviceId} isLoading={props.isLoadingServices} onSelect={props.onServiceSelect} />}
      
      <LockRow label={props.changeDoctor ? 'Doctor unlocked' : `Dr. ${props.appointment.doctor?.firstName ?? ''} ${props.appointment.doctor?.lastName ?? ''}`} action={props.changeDoctor ? 'Keep Original Doctor' : 'Change Doctor'} onClick={props.onToggleDoctor} />
      
      {/* 1. Date Selection */}
      <div>
        <label className="text-[10px] text-text-muted mb-0.5 block font-bold uppercase">New Date <span className="text-red-400">*</span></label>
        <input
          type="date"
          value={props.date}
          onChange={(e) => props.onDateSelect(e.target.value)}
          className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary focus:outline-none focus:border-primary-start/60 w-full"
          required
        />
      </div>

      {/* 2. Dentist Selection */}
      {props.changeDoctor && (
        <div>
          <label className="text-[10px] text-text-muted mb-0.5 block font-bold uppercase">Assign Dentist <span className="text-red-400">*</span></label>
          <select
            value={props.doctorId}
            onChange={(e) => props.onDoctorSelect(e.target.value)}
            className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary focus:outline-none focus:border-primary-start/60 w-full"
            required
          >
            <option value="">Select Dentist...</option>
            {props.doctors.map((d) => (
              <option key={d.doctorId} value={d.doctorId}>{d.doctorName}</option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Time Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">Start Time <span className="text-red-400">*</span></span>
          <input
            type="time"
            value={props.startTime}
            onChange={(e) => props.onStartTimeChange(e.target.value)}
            className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary focus:outline-none focus:border-primary-start/60"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">End Time <span className="text-red-400">*</span></span>
          <input
            type="time"
            value={props.endTime}
            onChange={(e) => props.onEndTimeChange(e.target.value)}
            className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary focus:outline-none focus:border-primary-start/60"
            required
          />
        </div>
      </div>

      {/* 4. Justification */}
      <div>
        <label className="text-[10px] text-text-muted mb-0.5 block font-bold uppercase">Justification Reason <span className="text-red-400">*</span></label>
        <Textarea placeholder="Why is this being rescheduled?" value={props.justification} onChange={(event) => props.onJustificationChange(event.target.value)} className="text-xs w-full min-h-[60px]" required />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={props.isSubmitting || !props.date || !props.activeDoctorId || !props.startTime || !props.endTime || !props.justification.trim()} className="text-xs py-1.5 flex-1 bg-primary text-white">{props.isSubmitting ? 'Saving...' : 'Confirm Reschedule'}</Button>
        <Button type="button" onClick={props.onBack} className="text-xs py-1.5 flex-1 border border-card-border text-text-primary bg-transparent">Back</Button>
      </div>
    </form>
  );
}

function LockRow({ label, action, onClick }: { label: string; action: string; onClick: () => void }) {
  return <div className="flex items-center justify-between bg-secondary-bg/20 rounded-xl px-3 py-2 border border-card-border/60"><span className="text-[11px] text-text-secondary font-semibold">{label}</span><button type="button" onClick={onClick} className="text-[10px] font-bold text-primary underline ml-2 shrink-0">{action}</button></div>;
}

function ServiceSelector({ services, selectedId, isLoading, onSelect }: { services: ServiceResponseDto[]; selectedId: string; isLoading: boolean; onSelect: (serviceId: string) => void }) {
  return <div><label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select New Treatment</label>{isLoading ? <span className="text-xs text-text-muted">Loading services...</span> : <div className="flex flex-wrap gap-2">{services.map((service) => <button key={service.id} type="button" onClick={() => onSelect(service.id)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${selectedId === service.id ? 'bg-primary text-white border-primary' : 'bg-card border-card-border/80 text-text-secondary hover:border-primary/60'}`}>{service.name}</button>)}</div>}</div>;
}


