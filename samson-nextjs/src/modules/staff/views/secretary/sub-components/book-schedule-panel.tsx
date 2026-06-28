'use client';

import { Button } from '@/components/ui/button';
import { formatClinicTime } from '@/shared/utils/date.util';

interface BookSchedulePanelProps {
  services: { id: string; name: string }[];
  selectedService: string;
  selectService: (serviceId: string) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  availableDates: string[];
  selectedDate: string;
  selectDate: (date: string) => void;
  availableDoctors: { doctorId: string; doctorName: string }[];
  selectedDoctor: string;
  selectDoctor: (doctorId: string) => void;
  timeslots: { startTime: string; endTime: string }[];
  selectedTime: string;
  selectTimeslot: (slot: { startTime: string; endTime: string }) => void;
  patientNote: string;
  setPatientNote: (value: string) => void;
  isLoadingServices: boolean;
  isLoadingDays: boolean;
  isLoadingDoctors: boolean;
  isLoadingSlots: boolean;
  isSubmitting: boolean;
  isReadyToSubmit: boolean;
  onSubmit: () => void;
}

export function BookSchedulePanel(props: BookSchedulePanelProps) {
  return (
    <div className="lg:col-span-7 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-5 justify-between">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-text-secondary">Service & Schedule</h2>
          <p className="text-xs text-text-muted">Select service, date, doctor, and time slot.</p>
        </div>
        <ServiceChips {...props} />
        <ScheduleCalendar {...props} />
        <PatientNote value={props.patientNote} onChange={props.setPatientNote} />
      </div>
      <Button type="button" variant="primary" className="w-full text-xs font-bold py-3 mt-2" disabled={props.isSubmitting || !props.isReadyToSubmit} onClick={props.onSubmit}>
        {props.isSubmitting ? 'Booking...' : 'Book Appointment'}
      </Button>
    </div>
  );
}

function ServiceChips(props: BookSchedulePanelProps) {
  return (
    <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-2">
      <label className="text-[9px] font-bold text-text-secondary uppercase">Service</label>
      {props.isLoadingServices ? (
        <div className="text-xs text-text-muted animate-pulse">Loading services...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {props.services.map((service) => (
            <button key={service.id} type="button" onClick={() => props.selectService(service.id)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${props.selectedService === service.id ? 'bg-primary-start text-white border-primary-start shadow-sm' : 'bg-card border-card-border text-text-secondary hover:text-text-primary'}`}>
              {service.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleCalendar(props: BookSchedulePanelProps) {
  const year = props.currentMonth.getFullYear();
  const month = props.currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, index) => index + 1);
  const blankDays = Array.from({ length: firstDayIndex });
  const monthLabel = props.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-text-secondary uppercase">Select Date</label>
        <div className="p-3 bg-card border border-card-border rounded-2xl">
          <CalendarHeader monthLabel={monthLabel} year={year} month={month} onMonthChange={props.setCurrentMonth} />
          {props.isLoadingDays ? (
            <div className="text-center text-xs text-text-muted py-6 animate-pulse">Scanning available dates...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`${day}-${index}`} className="font-bold text-text-muted py-1">{day}</div>)}
              {blankDays.map((_, index) => <div key={`blank-${index}`} className="py-1.5" />)}
              {daysArray.map((day) => {
                const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                return <CalendarDay key={day} day={day} date={date} isAvailable={props.availableDates.includes(date)} isSelected={props.selectedDate === date} onSelect={props.selectDate} />;
              })}
            </div>
          )}
        </div>
      </div>
      {props.selectedDate && <DoctorPicker {...props} />}
      {props.selectedDoctor && <TimeslotPicker {...props} />}
    </div>
  );
}

function CalendarHeader({ monthLabel, year, month, onMonthChange }: { monthLabel: string; year: number; month: number; onMonthChange: (date: Date) => void }) {
  return (
    <div className="flex justify-between items-center text-xs text-text-primary mb-3 font-bold bg-secondary-bg/10 p-2 rounded-xl">
      <button type="button" onClick={() => onMonthChange(new Date(year, month - 1, 1))} className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold">Prev</button>
      <div className="font-extrabold uppercase tracking-wide">{monthLabel}</div>
      <button type="button" onClick={() => onMonthChange(new Date(year, month + 1, 1))} className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold">Next</button>
    </div>
  );
}

function CalendarDay({ day, date, isAvailable, isSelected, onSelect }: { day: number; date: string; isAvailable: boolean; isSelected: boolean; onSelect: (date: string) => void }) {
  return (
    <button type="button" disabled={!isAvailable} onClick={() => onSelect(date)} className={`py-1.5 rounded-lg font-semibold transition-colors ${isSelected ? 'bg-primary-start text-white' : isAvailable ? 'text-text-secondary hover:bg-secondary-bg/50 cursor-pointer font-bold border border-emerald-500/20 bg-emerald-500/5' : 'text-text-muted/40 opacity-40 cursor-not-allowed'}`}>
      {day}
    </button>
  );
}

function DoctorPicker(props: BookSchedulePanelProps) {
  return <ChoiceGrid label="Available Dentist" isLoading={props.isLoadingDoctors} loadingLabel="Scanning schedules..." emptyLabel="No doctors scheduled for this service on this date." items={props.availableDoctors} selectedId={props.selectedDoctor} getId={(doctor) => doctor.doctorId} getTitle={(doctor) => doctor.doctorName} getCaption={() => 'Shift scheduled'} onSelect={props.selectDoctor} />;
}

function TimeslotPicker(props: BookSchedulePanelProps) {
  return <ChoiceGrid label="Timeslot" isLoading={props.isLoadingSlots} loadingLabel="Retrieving slots..." emptyLabel="No available timeslots for this dentist on this date." items={props.timeslots} selectedId={props.selectedTime} getId={(slot) => slot.startTime} getTitle={(slot) => formatTimeLabel(slot.startTime)} getCaption={() => ''} onSelect={(startTime) => props.selectTimeslot(props.timeslots.find((slot) => slot.startTime === startTime)!)} />;
}

function ChoiceGrid<T>({ label, isLoading, loadingLabel, emptyLabel, items, selectedId, getId, getTitle, getCaption, onSelect }: { label: string; isLoading: boolean; loadingLabel: string; emptyLabel: string; items: T[]; selectedId: string; getId: (item: T) => string; getTitle: (item: T) => string; getCaption: (item: T) => string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2 animate-fadeIn relative">
      <label className="text-[10px] font-bold text-text-secondary uppercase">{label}</label>
      {isLoading && <div className="absolute inset-0 bg-card/60 z-10 flex items-center justify-center rounded-xl"><span className="text-xs font-bold text-primary-start animate-pulse">{loadingLabel}</span></div>}
      {items.length === 0 && !isLoading ? (
        <div className="text-xs text-text-muted p-3 bg-secondary-bg/10 rounded-xl">{emptyLabel}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => <ChoiceCard key={getId(item)} item={item} selectedId={selectedId} getId={getId} getTitle={getTitle} getCaption={getCaption} onSelect={onSelect} />)}
        </div>
      )}
    </div>
  );
}

function ChoiceCard<T>({ item, selectedId, getId, getTitle, getCaption, onSelect }: { item: T; selectedId: string; getId: (item: T) => string; getTitle: (item: T) => string; getCaption: (item: T) => string; onSelect: (id: string) => void }) {
  const id = getId(item);
  return <button type="button" onClick={() => onSelect(id)} className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col gap-1 text-left ${selectedId === id ? 'bg-primary-start/10 border-primary-start/50' : 'bg-card border-card-border hover:border-text-muted/30'}`}><span className="text-xs font-bold text-text-primary">{getTitle(item)}</span>{getCaption(item) && <span className="text-[9px] text-text-muted">{getCaption(item)}</span>}</button>;
}

function PatientNote({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-2"><label className="text-xs font-bold text-text-primary uppercase">Patient Note (Optional)</label><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="e.g. tooth sensitivity, prefers mornings, urgent..." rows={3} className="w-full text-xs p-3 rounded-xl border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50" /></div>;
}

function formatTimeLabel(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  } catch {
    return isoStr;
  }
}
