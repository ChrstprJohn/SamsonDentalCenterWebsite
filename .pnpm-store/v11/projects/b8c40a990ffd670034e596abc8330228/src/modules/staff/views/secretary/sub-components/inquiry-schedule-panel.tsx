'use client';

interface InquirySchedulePanelProps {
  services: { id: string; name: string }[];
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  availableDates: string[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  doctors: { doctorId: string; doctorName: string }[];
  selectedDoctor: string;
  onDoctorSelect: (doctorId: string) => void;
  slots: { startTime: string; endTime: string }[];
  selectedTime: string;
  onSlotSelect: (slot: { startTime: string; endTime: string }) => void;
  isLoadingServices: boolean;
  isLoadingDays: boolean;
  isLoadingDoctors: boolean;
  isLoadingSlots: boolean;
}

export function InquirySchedulePanel(props: InquirySchedulePanelProps) {
  return (
    <div className="flex flex-col gap-3 animate-fadeIn">
      <ServiceSelector {...props} />
      <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-5">
        <DateSelector {...props} />
        {props.selectedDate && <DoctorSelector {...props} />}
        {props.selectedDoctor && <SlotSelector {...props} />}
      </div>
    </div>
  );
}

function ServiceSelector(props: InquirySchedulePanelProps) {
  return (
    <div className="border border-card-border/60 rounded-2xl p-4 bg-secondary-bg/10 flex flex-col gap-2">
      <label className="text-[9px] font-bold text-text-secondary uppercase">Staged Clinic Service</label>
      {props.isLoadingServices ? <div className="text-xs text-text-muted animate-pulse">Loading clinic services...</div> : (
        <div className="flex flex-wrap gap-2">
          {props.services.map((service) => <button key={service.id} type="button" onClick={() => props.onServiceSelect(service.id)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${props.selectedService === service.id ? 'bg-primary-start text-white border-primary-start shadow-sm' : 'bg-card border-card-border text-text-secondary hover:text-text-primary'}`}>{service.name}</button>)}
        </div>
      )}
    </div>
  );
}

function DateSelector(props: InquirySchedulePanelProps) {
  const year = props.currentMonth.getFullYear();
  const month = props.currentMonth.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: new Date(year, month, 1).getDay() });
  const days = Array.from({ length: totalDays }, (_, index) => index + 1);
  const monthLabel = props.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-text-secondary uppercase">Select Date</label>
      <div className="p-3 bg-card border border-card-border rounded-2xl">
        <div className="flex justify-between items-center text-xs text-text-primary mb-3 font-bold bg-secondary-bg/10 p-2 rounded-xl">
          <button type="button" onClick={() => props.onMonthChange(new Date(year, month - 1, 1))} className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold">Prev</button>
          <div className="font-extrabold uppercase tracking-wide">{monthLabel}</div>
          <button type="button" onClick={() => props.onMonthChange(new Date(year, month + 1, 1))} className="px-2.5 py-1 rounded hover:bg-secondary-bg/40 font-bold">Next</button>
        </div>
        {props.isLoadingDays ? <div className="text-center text-xs text-text-muted py-6 animate-pulse">Scanning available dates...</div> : (
          <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`${day}-${index}`} className="font-bold text-text-muted py-1">{day}</div>)}
            {blanks.map((_, index) => <div key={`blank-${index}`} className="py-1.5" />)}
            {days.map((day) => {
              const date = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isAvailable = props.availableDates.includes(date);
              const isSelected = props.selectedDate === date;
              return <button key={day} type="button" disabled={!isAvailable} onClick={() => props.onDateSelect(date)} className={`py-1.5 rounded-lg font-semibold transition-colors ${isSelected ? 'bg-primary-start text-white hover:bg-primary-start' : isAvailable ? 'text-text-secondary hover:bg-secondary-bg/50 cursor-pointer font-bold border border-emerald-500/20 bg-emerald-500/5' : 'text-text-muted/40 opacity-40 cursor-not-allowed'}`}>{day}</button>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DoctorSelector(props: InquirySchedulePanelProps) {
  return <ChoiceGrid label="Available Dentist" loadingLabel="Scanning schedules..." emptyLabel="No doctors scheduled for this service on this date." isLoading={props.isLoadingDoctors} items={props.doctors} selectedId={props.selectedDoctor} getId={(doctor) => doctor.doctorId} getLabel={(doctor) => doctor.doctorName} onSelect={props.onDoctorSelect} />;
}

function SlotSelector(props: InquirySchedulePanelProps) {
  return <ChoiceGrid label="Timeslot" loadingLabel="Retrieving slots..." emptyLabel="No available timeslots for this dentist on this date." isLoading={props.isLoadingSlots} items={props.slots} selectedId={props.selectedTime} getId={(slot) => slot.startTime} getLabel={(slot) => formatTimeLabel(slot.startTime)} onSelect={(startTime) => props.onSlotSelect(props.slots.find((slot) => slot.startTime === startTime)!)} />;
}

function ChoiceGrid<T>({ label, loadingLabel, emptyLabel, isLoading, items, selectedId, getId, getLabel, onSelect }: { label: string; loadingLabel: string; emptyLabel: string; isLoading: boolean; items: T[]; selectedId: string; getId: (item: T) => string; getLabel: (item: T) => string; onSelect: (id: string) => void }) {
  return <div className="flex flex-col gap-2 animate-fadeIn relative"><label className="text-[10px] font-bold text-text-secondary uppercase">{label}</label>{isLoading && <div className="absolute inset-0 bg-card/60 z-10 flex items-center justify-center rounded-xl"><span className="text-xs font-bold text-primary-start animate-pulse">{loadingLabel}</span></div>}{items.length === 0 && !isLoading ? <div className="text-xs text-text-muted p-3 bg-secondary-bg/10 rounded-xl">{emptyLabel}</div> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{items.map((item) => { const id = getId(item); return <button key={id} type="button" onClick={() => onSelect(id)} className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col gap-1 text-left ${selectedId === id ? 'bg-primary-start/10 border-primary-start/50' : 'bg-card border-card-border hover:border-text-muted/30'}`}><span className="text-xs font-bold text-text-primary">{getLabel(item)}</span><span className="text-[9px] text-text-muted">Shift scheduled</span></button>; })}</div>}</div>;
}

function formatTimeLabel(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' });
  } catch {
    return isoStr;
  }
}
