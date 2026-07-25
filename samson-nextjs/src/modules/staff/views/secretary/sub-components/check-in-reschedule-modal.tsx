'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
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
          className="bg-card border border-card-border rounded-3xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => view.setRescheduleAppt(null)}
            className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
          
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
            justification={view.rescheduleJustification || 'Patient requested reschedule'}
            isSubmitting={view.isPending}
            onServiceSelect={(sId) => view.setRescheduleService?.(sId)}
            onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
            onDateSelect={(d) => view.setRescheduleDate(d)}
            onStartTimeChange={(t) => view.setRescheduleTime(t)}
            onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
            onJustificationChange={(j) => view.setRescheduleJustification?.(j)}
            onSubmit={view.handleRescheduleSubmit}
            onBack={() => view.setRescheduleAppt(null)}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
