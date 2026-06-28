'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function CheckInRescheduleModal({ view }: { view: any }) {
  if (!view.rescheduleAppt) return null;
  const appointment = view.rescheduleAppt;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative">
          <button onClick={() => view.setRescheduleAppt(null)} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 rounded-full"><X className="h-4 w-4" /></button>
          <div className="flex flex-col gap-0.5 border-b border-card-border/50 pb-3"><h2 className="text-sm font-black text-text-primary">Reschedule Appointment</h2><p className="text-[11px] text-text-muted">Move {appointment.patient?.firstName}'s slot to a new date/time</p></div>
          <div className="flex flex-col gap-3"><Field label="New Date"><Input type="date" value={view.rescheduleDate} min={view.todayStr} onChange={(event) => view.setRescheduleDate(event.target.value)} className="text-xs rounded-xl" /></Field><Field label="New Start Time"><Input type="time" value={view.rescheduleTime} onChange={(event) => view.setRescheduleTime(event.target.value)} className="text-xs rounded-xl" /></Field><Field label="Assign Doctor"><Select value={view.rescheduleDoctor} onChange={(event) => view.setRescheduleDoctor(event.target.value)} className="text-xs rounded-xl bg-card border border-card-border" options={[{ value: appointment.doctorId, label: 'Keep Original Doctor' }]} /></Field></div>
          <div className="flex gap-3 pt-3 mt-1"><Button onClick={() => view.setRescheduleAppt(null)} variant="secondary" className="w-full text-xs font-bold h-9 border-none rounded-xl">Cancel</Button><Button onClick={view.handleRescheduleSubmit} disabled={view.isPending || !view.rescheduleDate || !view.rescheduleTime} className="w-full text-xs font-bold h-9 bg-primary-start border-none rounded-xl">Save Schedule</Button></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[9px] font-bold text-text-secondary uppercase">{label}</label>{children}</div>;
}
