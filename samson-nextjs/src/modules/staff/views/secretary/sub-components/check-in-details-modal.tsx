'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatClinicTime } from '@/shared/utils/date.util';

export function CheckInDetailsModal({ view }: { view: any }) {
  if (!view.viewAppt) return null;
  const appointment = view.viewAppt;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative"
        >
          <button
            onClick={() => view.setViewAppt(null)}
            className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-0.5 border-b border-card-border/50 pb-3">
            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed Visit</span>
            </div>
            <h2 className="text-sm font-black text-text-primary">Visit Details</h2>
            <p className="text-[11px] text-text-muted">Summary of completed appointment</p>
          </div>

          <div className="flex flex-col gap-3.5 text-xs text-text-secondary bg-secondary-bg/30 p-4 rounded-2xl border border-card-border/30">
            <Row label="Patient" value={`${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`} />
            <Row label="Attending Doctor" value={`Dr. ${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`} />
            <Row label="Service Rendered" value={appointment.service?.name || 'Procedure'} />
            <Row label="Date" value={appointment.date} />
            <Row
              label="Scheduled Slot"
              value={`${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`}
            />
            {appointment.statusReason && (
              <div className="border-t border-card-border/30 pt-2 flex flex-col gap-1">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Completion Log:</span>
                <span className="text-[11px] text-text-secondary italic">{appointment.statusReason}</span>
              </div>
            )}
          </div>

          <Button
            onClick={() => view.setViewAppt(null)}
            variant="secondary"
            className="w-full text-xs font-bold h-10 border-none rounded-xl mt-1"
          >
            Close Details
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-text-muted">{label}:</span>
      <span className="font-extrabold text-text-primary">{value}</span>
    </div>
  );
}
