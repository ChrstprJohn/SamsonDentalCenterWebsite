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
  month: Date;
  availableDates: string[];
  isLoadingDays: boolean;
  date: string;
  activeServiceId: string;
  activeDoctorId: string;
  slots: AvailableSlotDto[];
  isLoadingSlots: boolean;
  startTime: string;
  justification: string;
  isSubmitting: boolean;
  onToggleTreatment: () => void;
  onServiceSelect: (serviceId: string) => void;
  onToggleDoctor: () => void;
  onDoctorSelect: (doctorId: string) => void;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: string) => void;
  onSlotSelect: (slot: AvailableSlotDto) => void;
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
      <LockRow label={props.changeDoctor ? 'Doctor unlocked - pick after selecting date' : `Dr. ${props.appointment.doctor?.firstName ?? ''} ${props.appointment.doctor?.lastName ?? ''}`} action={props.changeDoctor ? 'Keep Original Doctor' : 'Change Doctor'} onClick={props.onToggleDoctor} />
      {props.activeServiceId && (
        <DateSelector month={props.month} availableDates={props.availableDates} selectedDate={props.date} isLoading={props.isLoadingDays} onMonthChange={props.onMonthChange} onDateSelect={props.onDateSelect} />
      )}
      {props.changeDoctor && props.date && (
        <DoctorSelector doctors={props.doctors} selectedId={props.doctorId} isLoading={props.isLoadingDoctors} onSelect={props.onDoctorSelect} />
      )}
      {props.date && props.activeDoctorId && (
        <SlotSelector slots={props.slots} selectedStartTime={props.startTime} isLoading={props.isLoadingSlots} onSelect={props.onSlotSelect} />
      )}
      <div>
        <label className="text-[10px] text-text-muted mb-0.5 block font-bold uppercase">Justification Reason <span className="text-red-400">*</span></label>
        <Textarea placeholder="Why is this being rescheduled?" value={props.justification} onChange={(event) => props.onJustificationChange(event.target.value)} className="text-xs w-full min-h-[60px]" required />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={props.isSubmitting || !props.date || !props.activeDoctorId || !props.startTime || !props.justification.trim()} className="text-xs py-1.5 flex-1 bg-primary text-white">{props.isSubmitting ? 'Saving...' : 'Confirm Reschedule'}</Button>
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

function DateSelector({ month, availableDates, selectedDate, isLoading, onMonthChange, onDateSelect }: { month: Date; availableDates: string[]; selectedDate: string; isLoading: boolean; onMonthChange: (date: Date) => void; onDateSelect: (date: string) => void }) {
  const days = Array.from({ length: new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() }, (_, index) => index + 1);
  const blanks = Array.from({ length: new Date(month.getFullYear(), month.getMonth(), 1).getDay() });
  const toDate = (day: number) => `${month.getFullYear()}-${(month.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return (
    <div>
      <label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select New Date</label>
      <div className="flex items-center justify-between mb-2"><button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="text-text-muted hover:text-text-primary px-2 text-sm">Prev</button><span className="text-xs font-semibold text-text-primary">{month.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span><button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="text-text-muted hover:text-text-primary px-2 text-sm">Next</button></div>
      {isLoading ? <span className="text-xs text-text-muted">Loading available days...</span> : <div className="grid grid-cols-7 gap-0.5 text-center">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day} className="text-[9px] text-text-muted font-bold py-0.5">{day}</span>)}{blanks.map((_, index) => <span key={`blank-${index}`} />)}{days.map((day) => <DateButton key={day} day={day} date={toDate(day)} isAvailable={availableDates.includes(toDate(day))} isSelected={selectedDate === toDate(day)} onSelect={onDateSelect} />)}</div>}
    </div>
  );
}

function DateButton({ day, date, isAvailable, isSelected, onSelect }: { day: number; date: string; isAvailable: boolean; isSelected: boolean; onSelect: (date: string) => void }) {
  return <button type="button" disabled={!isAvailable} onClick={() => onSelect(date)} className={`rounded-lg py-1 text-[11px] font-semibold transition-all ${isSelected ? 'bg-primary text-white' : isAvailable ? 'hover:bg-primary/20 text-text-primary' : 'text-text-muted/30 cursor-not-allowed'}`}>{day}</button>;
}

function DoctorSelector({ doctors, selectedId, isLoading, onSelect }: { doctors: AvailableDoctorItem[]; selectedId: string; isLoading: boolean; onSelect: (doctorId: string) => void }) {
  if (isLoading) return <span className="text-xs text-text-muted">Loading doctors...</span>;
  if (doctors.length === 0) return <span className="text-xs text-text-muted italic">No doctors available for selected date.</span>;
  return <div><label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select New Dentist</label><div className="flex flex-col gap-2">{doctors.map((doctor) => <button key={doctor.doctorId} type="button" onClick={() => onSelect(doctor.doctorId)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${selectedId === doctor.doctorId ? 'border-primary bg-primary/10' : 'border-card-border hover:border-primary/60'}`}><div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{doctor.doctorName?.charAt(0) ?? 'D'}</div><span className="text-xs font-semibold text-text-primary">{doctor.doctorName}</span></button>)}</div></div>;
}

function SlotSelector({ slots, selectedStartTime, isLoading, onSelect }: { slots: AvailableSlotDto[]; selectedStartTime: string; isLoading: boolean; onSelect: (slot: AvailableSlotDto) => void }) {
  if (isLoading) return <span className="text-xs text-text-muted">Loading timeslots...</span>;
  if (slots.length === 0) return <span className="text-xs text-text-muted italic">No slots available for this date.</span>;
  return <div><label className="text-[10px] text-text-muted mb-1.5 block font-bold uppercase">Select Time Slot</label><div className="grid grid-cols-2 gap-1.5">{slots.map((slot) => <button key={slot.startTime} type="button" onClick={() => onSelect(slot)} className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${selectedStartTime === slot.startTime ? 'bg-primary text-white border-primary' : 'border-card-border hover:border-primary/60 text-text-primary'}`}>{formatClinicTime(slot.startTime)} - {formatClinicTime(slot.endTime)}</button>)}</div></div>;
}
