'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/feedback/toast-container';

interface UserDashboardViewProps {
  maxReschedules: number;
}

interface AppointmentRecord {
  id: string;
  serviceName: string;
  serviceId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  rescheduleCount: number;
  price: number;
  clinicianNotes?: string;
  cancellationReason?: string;
}

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'appt-1',
    serviceName: 'Teeth Whitening (Laser)',
    serviceId: 's-2',
    doctorName: 'Dr. Sarah Samson',
    date: '2026-06-15',
    time: '10:30 AM',
    status: 'SCHEDULED',
    rescheduleCount: 0,
    price: 299,
  },
  {
    id: 'appt-2',
    serviceName: 'Routine Dental Cleaning',
    serviceId: 's-1',
    doctorName: 'Dr. James Mercer',
    date: '2026-06-18',
    time: '09:00 AM',
    status: 'PENDING',
    rescheduleCount: 0,
    price: 99,
  },
  {
    id: 'appt-3',
    serviceName: 'Orthodontic Consultation',
    serviceId: 's-4',
    doctorName: 'Dr. Sarah Samson',
    date: '2026-05-10',
    time: '02:00 PM',
    status: 'COMPLETED',
    rescheduleCount: 0,
    price: 0,
    clinicianNotes: 'Patient shows excellent jaw structural modeling. Standard scanner images saved successfully.',
  },
];

export function UserDashboardView({ maxReschedules }: UserDashboardViewProps) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(INITIAL_APPOINTMENTS);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentRecord | null>(null);
  
  // Cancellation Modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Reschedule alert state
  const [blockedRescheduleAppt, setBlockedRescheduleAppt] = useState<AppointmentRecord | null>(null);

  const { addToast } = useToast();
  const router = useRouter();

  const handleReschedule = (appt: AppointmentRecord) => {
    // 1. Checks reschedule count against boundaries limit
    if (appt.rescheduleCount >= maxReschedules) {
      setBlockedRescheduleAppt(appt);
      return;
    }

    // 2. Increment reschedule count and redirect to BookingDateTime scheduler step
    const updated = appointments.map((a) => {
      if (a.id === appt.id) {
        return { ...a, rescheduleCount: a.rescheduleCount + 1 };
      }
      return a;
    });
    setAppointments(updated);

    addToast('Redirecting to scheduler page...', 'info');
    router.push(`/user/booking?service=${appt.serviceId}&reschedule=true`);
  };

  const handleCancelClick = (appt: AppointmentRecord) => {
    setSelectedAppt(appt);
    setIsCancelModalOpen(true);
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !cancelReason) return;

    setIsCancelling(true);
    // Simulate API cancellation trigger
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsCancelling(false);

    const updated = appointments.map((a) => {
      if (a.id === selectedAppt.id) {
        return {
          ...a,
          status: 'CANCELLED' as const,
          cancellationReason: cancelReason,
        };
      }
      return a;
    });
    setAppointments(updated);

    addToast('Appointment cancelled successfully.', 'success');
    setIsCancelModalOpen(false);
    setCancelReason('');
    setSelectedAppt(null);
  };

  const scheduled = appointments.filter((a) => a.status === 'SCHEDULED');
  const pending = appointments.filter((a) => a.status === 'PENDING');
  const history = appointments.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED');

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Patient Dashboard</h2>
          <p className="text-xs text-slate-500">Oversee, track, reschedule, or cancel your clinic reservations in real-time.</p>
        </div>
        <Button onClick={() => router.push('/user/booking')}>
          + New Booking
        </Button>
      </div>

      {/* 🗓️ 1. Upcoming Appointments Panel */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Upcoming Reservations</h3>
        {scheduled.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduled.map((appt) => (
              <div
                key={appt.id}
                className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-lg flex flex-col justify-between gap-6 hover:shadow-xl transition-all duration-350"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 uppercase tracking-wide">
                      Scheduled
                    </span>
                    <span className="text-[10px] text-slate-400">Reschedules: {appt.rescheduleCount}/{maxReschedules}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-1">{appt.serviceName}</h4>
                  <p className="text-xs text-slate-500">👨‍⚕️ {appt.doctorName}</p>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-2">⏳ {appt.date} at {appt.time}</p>
                </div>
                <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-4">
                  <Button variant="secondary" size="sm" onClick={() => handleCancelClick(appt)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleReschedule(appt)}>
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
            No scheduled reservations found.
          </div>
        )}
      </section>

      {/* ⏳ 2. Pending Approvals Panel */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Awaiting Secretary Approvals</h3>
        {pending.length > 0 ? (
          <div className="flex flex-col gap-4">
            {pending.map((appt) => (
              <div
                key={appt.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-1">
                  <span className="inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-150/10 text-amber-600 dark:text-amber-450 uppercase tracking-wide">
                    Awaiting Approval
                  </span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mt-1">{appt.serviceName}</h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400">📅 {appt.date} at {appt.time} with {appt.doctorName}</p>
                </div>
                <Button variant="secondary" size="sm" className="sm:self-center" onClick={() => handleCancelClick(appt)}>
                  Cancel Request
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
            No pending requests awaiting approval.
          </div>
        )}
      </section>

      {/* 📜 3. Appointment History Timeline */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Appointment History</h3>
        {history.length > 0 ? (
          <div className="border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-slate-900/20">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {history.map((appt) => (
                <div key={appt.id} className="p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        appt.status === 'COMPLETED'
                          ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-650 dark:text-emerald-450'
                          : 'bg-rose-100 dark:bg-rose-500/10 text-rose-650 dark:text-rose-450'
                      }`}>
                        {appt.status}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white mt-2">{appt.serviceName}</h4>
                      <span className="text-xs text-slate-400">📅 {appt.date} with {appt.doctorName}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {appt.price > 0 ? `$${appt.price}` : 'Free'}
                    </span>
                  </div>

                  {appt.clinicianNotes && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-xs border border-slate-100 dark:border-white/5 text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">
                      <span className="font-bold block text-slate-700 dark:text-slate-350 mb-1">👩‍⚕️ Treatment remarks:</span>
                      {appt.clinicianNotes}
                    </div>
                  )}

                  {appt.cancellationReason && (
                    <div className="bg-rose-500/5 p-4 rounded-xl text-xs border border-rose-500/10 text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">
                      <span className="font-bold block text-rose-500 dark:text-rose-400 mb-1">❌ Cancellation Reason:</span>
                      {appt.cancellationReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-white/5 rounded-3xl text-sm text-slate-400">
            No history logs found.
          </div>
        )}
      </section>

      {/* Reschedule Limit Reached Dialog warning */}
      <Modal
        isOpen={blockedRescheduleAppt !== null}
        onClose={() => setBlockedRescheduleAppt(null)}
        title="Rescheduling Blocked"
        size="sm"
      >
        <div className="flex flex-col gap-4 text-sm text-slate-700 dark:text-slate-350 py-1">
          <p className="leading-relaxed">
            You have already reached the online rescheduling limit (<strong>{maxReschedules} time</strong>) for this appointment.
          </p>
          <div className="p-3.5 rounded-xl border border-blue-200/60 bg-blue-500/5 text-xs flex flex-col gap-1 mt-1">
            <span className="font-bold text-blue-600 dark:text-blue-400">Please Contact Roster Staff</span>
            <span>Reach out directly to the receptionist to manually reschedule:</span>
            <span className="font-semibold mt-1">📞 (555) 0101</span>
          </div>
          <div className="flex justify-end border-t border-slate-100 dark:border-white/5 pt-4 mt-3">
            <Button onClick={() => setBlockedRescheduleAppt(null)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancellation Reason Modal Popup */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAppt(null);
          setCancelReason('');
        }}
        title="Cancel Appointment"
        size="sm"
      >
        <form onSubmit={handleCancelSubmit} className="flex flex-col gap-4 text-sm text-slate-750 dark:text-slate-350 py-1">
          <p className="leading-relaxed">
            Are you sure you want to cancel your <strong>{selectedAppt?.serviceName}</strong> appointment?
          </p>
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-semibold text-slate-500">Provide Cancellation Reason</label>
            <textarea
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please let us know why you need to cancel (e.g. scheduling conflict)..."
              rows={3}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-white/5 pt-4 mt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCancelModalOpen(false);
                setSelectedAppt(null);
                setCancelReason('');
              }}
            >
              Close
            </Button>
            <Button type="submit" variant="danger" disabled={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
