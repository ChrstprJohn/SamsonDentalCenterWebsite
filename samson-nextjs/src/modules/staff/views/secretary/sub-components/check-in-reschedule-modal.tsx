'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';

export function CheckInRescheduleModal({ view }: { view: any }) {
  if (!view.rescheduleAppt) return null;
  const appointment = view.rescheduleAppt;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-card border border-card-border rounded-3xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-medium text-foreground">Reschedule</span>
              <p className="text-xs text-muted-foreground">Update date, time, dentist, or service details.</p>
            </div>
            <button
              onClick={() => view.clearSelection()}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
            <AppointmentRescheduleForm
              appointment={appointment}
              services={view.servicesList || []}
              serviceId={view.rescheduleService || appointment.serviceId}
              doctorId={view.rescheduleDoctor || appointment.doctorId}
              doctors={(view.doctorsList || []).map((d: any) => ({
                doctorId: d.id,
                doctorName: `${d.prefix || 'Dr.'} ${d.firstName} ${d.lastName}`,
              }))}
              date={view.rescheduleDate}
              activeServiceId={appointment.serviceId}
              activeDoctorId={appointment.doctorId}
              startTime={view.rescheduleTime}
              endTime={view.rescheduleEndTime || ''}
              justification={view.rescheduleJustification || ''}
              confirmationChannel={appointment.confirmationChannel || (appointment as any).confirmation_channel || 'EMAIL'}
              onConfirmationChannelChange={(channel) => {
                appointment.confirmationChannel = channel;
                (appointment as any).confirmation_channel = channel;
              }}
              isSubmitting={view.isPending}
              noFooter
              onServiceSelect={(sId) => view.setRescheduleService?.(sId)}
              onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
              onDateSelect={(d) => view.setRescheduleDate(d)}
              onStartTimeChange={(t) => view.setRescheduleTime(t)}
              onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
              onJustificationChange={(j) => view.setRescheduleJustification?.(j)}
              onSubmit={view.handleRescheduleSubmit}
              onBack={() => view.clearSelection()}
            />
          </div>
          <div className="shrink-0 border-t border-border flex gap-2 p-4">
            <Button
              onClick={view.handleRescheduleSubmit}
              disabled={view.isPending}
              className="flex-1 h-[42px] text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-xl disabled:opacity-50"
            >
              {view.isPending ? 'Saving...' : 'Confirm'}
            </Button>
            <Button
              variant="outline"
              onClick={() => view.clearSelection()}
              className="flex-1 h-[42px] text-sm font-medium"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
