'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Undo2, Wrench, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { formatClinicTime } from '@/shared/utils/date.util';

const TONE_CLASSES: Record<string, { dot: string; badge: string }> = {
  cyan: { dot: 'bg-cyan-500', badge: 'bg-cyan-500/10 text-cyan-600' },
  red: { dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-500' },
  indigo: { dot: 'bg-indigo-500', badge: 'bg-indigo-500/10 text-indigo-500' },
  emerald: { dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500' },
};

export function CheckInBoard({ view }: { view: any }) {
  const configs = [
    { key: 'approved', title: 'Upcoming Today', tone: 'cyan', empty: 'No arrivals expected.' },
    { key: 'noShow', title: 'No-Show', tone: 'red', empty: 'No missed slots today.' },
    { key: 'checkedIn', title: 'Checked In', tone: 'indigo', empty: 'No patients in rooms.' },
    { key: 'completed', title: 'Completed', tone: 'emerald', empty: 'No completed visits today.' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch flex-1 min-h-[500px]">
      {configs.map((config) => (
        <VisitColumn
          key={config.key}
          config={config}
          appointments={view.columns[config.key]}
          view={view}
        />
      ))}
    </div>
  );
}

function VisitColumn({ config, appointments, view }: { config: any; appointments: AppointmentDto[]; view: any }) {
  const tone = TONE_CLASSES[config.tone];
  return (
    <div className="bg-card/40 backdrop-blur-xs border border-card-border/50 rounded-3xl p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${tone.dot}`} />
          <span className="text-xs font-black text-text-primary uppercase tracking-wider">{config.title}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tone.badge}`}>{appointments.length}</span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-1">
        <AnimatePresence mode="popLayout">
          {appointments.map((appointment) => (
            <VisitCard key={appointment.id} appointment={appointment} columnKey={config.key} view={view} />
          ))}
        </AnimatePresence>
        {appointments.length === 0 && (
          <div className="text-center py-8 text-[10px] text-text-muted">{config.empty}</div>
        )}
      </div>
    </div>
  );
}

function VisitCard({ appointment, columnKey, view }: { appointment: AppointmentDto; columnKey: string; view: any }) {
  const checkInGate = view.getCheckInStatus(appointment);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 border border-card-border bg-card rounded-2xl shadow-xs transition-all flex flex-col gap-3"
    >
      <VisitSummary appointment={appointment} />

      {columnKey === 'approved' && (
        <Button
          onClick={() => view.setCheckInAppt(appointment)}
          disabled={!checkInGate.enabled || view.isPending}
          className="w-full text-[10px] h-8 font-bold bg-cyan-500 border-none rounded-xl"
        >
          {checkInGate.enabled ? 'Check In' : checkInGate.message}
        </Button>
      )}

      {columnKey === 'noShow' && (
        <Button
          onClick={() => view.setResolveAppt(appointment)}
          variant="secondary"
          className="w-full text-[10px] h-8 font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 rounded-xl flex items-center justify-center gap-1.5"
        >
          <Wrench className="h-3 w-3" />
          <span>Resolve No-Show</span>
        </Button>
      )}

      {columnKey === 'checkedIn' && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => view.setCheckoutAppt(appointment)}
            className="w-full text-[10px] h-8 font-bold bg-amber-500 border-none rounded-xl text-white flex items-center justify-center gap-1.5"
          >
            <Send className="h-3 w-3" />
            <span>Checkout & Send Review Msg</span>
          </Button>
          <Button
            onClick={() => view.handleUndoCheckIn(appointment.id)}
            disabled={view.isPending}
            variant="secondary"
            className="w-full text-[9px] h-6 font-bold bg-secondary-bg text-text-muted hover:text-text-primary border-none rounded-lg flex items-center justify-center"
          >
            <Undo2 className="h-2.5 w-2.5 mr-1" />
            Undo Check-In
          </Button>
        </div>
      )}

      {columnKey === 'completed' && (
        <Button
          onClick={() => view.handleViewApptDetails(appointment)}
          variant="secondary"
          className="w-full text-[10px] h-8 font-bold bg-secondary-bg border-none rounded-xl"
        >
          View Details
        </Button>
      )}
    </motion.div>
  );
}

function VisitSummary({ appointment }: { appointment: AppointmentDto }) {
  return (
    <div className="flex flex-col gap-1 text-xs">
      <span className="font-extrabold text-text-primary">
        {appointment.patient?.firstName} {appointment.patient?.lastName}
      </span>
      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <Clock className="h-3 w-3" />
        <span>
          {formatClinicTime(appointment.startTime)} - {formatClinicTime(appointment.endTime)}
        </span>
      </div>
      <span className="text-[10px] text-text-secondary">
        Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
      </span>
      <span className="inline-block self-start text-[9px] font-bold px-2 py-0.5 rounded-md bg-secondary-bg text-text-secondary mt-1">
        {appointment.service?.name}
      </span>
    </div>
  );
}
