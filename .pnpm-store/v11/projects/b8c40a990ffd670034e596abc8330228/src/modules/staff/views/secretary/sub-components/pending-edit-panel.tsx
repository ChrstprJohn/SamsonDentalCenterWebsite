'use client';

import { formatClinicTime, formatShortDate } from '@/shared/utils/date.util';

interface PendingEditPanelProps {
  isEditing: boolean;
  services: { id: string; name: string }[];
  serviceId: string;
  doctors: { id: string; firstName: string; lastName: string }[];
  doctorId: string;
  availableDates: string[];
  date: string;
  currentMonth: Date;
  slots: { startTime: string; endTime: string }[];
  startTime: string;
  note: string;
  isLoadingDays: boolean;
  isLoadingSlots: boolean;
  onToggle: () => void;
  onServiceChange: (serviceId: string) => void;
  onDoctorChange: (doctorId: string) => void;
  onDateChange: (date: string) => void;
  onMonthChange: (date: Date) => void;
  onSlotChange: (slot: { startTime: string; endTime: string }) => void;
  onNoteChange: (note: string) => void;
}

export function PendingEditPanel(props: PendingEditPanelProps) {
  return (
    <div className="border border-card-border/60 rounded-2xl overflow-hidden">
      <button type="button" onClick={props.onToggle} className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-text-secondary bg-secondary-bg/20 hover:bg-secondary-bg/40 transition-colors">
        <span>Edit Appointment Details Before Deciding</span>
        <span className="text-[10px] text-primary-start">{props.isEditing ? 'Collapse' : 'Expand'}</span>
      </button>
      {props.isEditing && (
        <div className="p-4 flex flex-col gap-4 bg-card border-t border-card-border/60">
          <PillGroup label="1. Select Service" items={props.services} selectedId={props.serviceId} getLabel={(service) => service.name} onSelect={props.onServiceChange} />
          {props.serviceId && <PillGroup label="2. Select Doctor" items={props.doctors} selectedId={props.doctorId} getLabel={(doctor) => `Dr. ${doctor.firstName} ${doctor.lastName}`} onSelect={props.onDoctorChange} />}
          {props.doctorId && (
            <DatePicker
              currentMonth={props.currentMonth}
              availableDates={props.availableDates}
              date={props.date}
              isLoading={props.isLoadingDays}
              onDateChange={props.onDateChange}
              onMonthChange={props.onMonthChange}
            />
          )}
          {props.date && (
            <SlotPicker slots={props.slots} startTime={props.startTime} isLoading={props.isLoadingSlots} onSlotChange={props.onSlotChange} />
          )}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">5. Secretary Note (Optional)</span>
            <textarea value={props.note} onChange={(event) => props.onNoteChange(event.target.value)} placeholder="Add an internal note or message for the patient..." rows={2} className="text-xs border border-card-border rounded-xl px-3 py-2 bg-secondary-bg/20 text-text-primary resize-none focus:outline-none focus:border-primary-start/60" />
          </div>
        </div>
      )}
    </div>
  );
}

function PillGroup<T extends { id: string }>({ label, items, selectedId, getLabel, onSelect }: { label: string; items: T[]; selectedId: string; getLabel: (item: T) => string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${selectedId === item.id ? 'bg-primary-start text-white border-primary-start' : 'bg-card border-card-border text-text-secondary hover:border-primary-start/50'}`}>
            {getLabel(item)}
          </button>
        ))}
      </div>
    </div>
  );
}

function DatePicker({ currentMonth, availableDates, date, isLoading, onDateChange, onMonthChange }: { currentMonth: Date; availableDates: string[]; date: string; isLoading: boolean; onDateChange: (date: string) => void; onMonthChange: (date: Date) => void }) {
  const shiftMonth = (amount: number) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + amount);
    onMonthChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">3. Select Date {isLoading && <span className="text-primary-start ml-1">Loading...</span>}</span>
      <div className="flex gap-2 items-center mb-1">
        <button type="button" onClick={() => shiftMonth(-1)} className="text-xs text-text-muted hover:text-text-primary px-1">Prev</button>
        <span className="text-xs font-bold text-text-primary">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button type="button" onClick={() => shiftMonth(1)} className="text-xs text-text-muted hover:text-text-primary px-1">Next</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {availableDates.length === 0 && !isLoading && <span className="text-[11px] text-text-muted">No available dates this month.</span>}
        {availableDates.map((availableDate) => (
          <button key={availableDate} type="button" onClick={() => onDateChange(availableDate)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${date === availableDate ? 'bg-primary-start text-white border-primary-start' : 'bg-card border-card-border text-text-secondary hover:border-primary-start/50'}`}>
            {formatShortDate(availableDate)}
          </button>
        ))}
      </div>
    </div>
  );
}

function SlotPicker({ slots, startTime, isLoading, onSlotChange }: { slots: { startTime: string; endTime: string }[]; startTime: string; isLoading: boolean; onSlotChange: (slot: { startTime: string; endTime: string }) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider">4. Select Time Slot {isLoading && <span className="text-primary-start ml-1">Loading...</span>}</span>
      <div className="flex flex-wrap gap-1.5">
        {slots.length === 0 && !isLoading && <span className="text-[11px] text-text-muted">No available slots on this date.</span>}
        {slots.map((slot) => (
          <button key={slot.startTime} type="button" onClick={() => onSlotChange(slot)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${startTime === slot.startTime ? 'bg-primary-start text-white border-primary-start' : 'bg-card border-card-border text-text-secondary hover:border-primary-start/50'}`}>
            {formatClinicTime(slot.startTime)}
          </button>
        ))}
      </div>
    </div>
  );
}
