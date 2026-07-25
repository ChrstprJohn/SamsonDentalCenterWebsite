'use client';

import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { formatClinicTime } from '@/shared/utils/date.util';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';

export function CheckInDetailPane({ view, onClose }: { view: any; onClose: () => void }) {
  const appointment = view.checkInAppt || view.checkoutAppt || view.viewAppt || view.resolveAppt || view.rescheduleAppt;

  if (!appointment) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2 px-6">
        <div className="text-xs font-medium">No appointment selected</div>
        <p className="text-[10px] text-center">Click an action button on a card to manage the visit.</p>
      </div>
    );
  }

  const paneType = view.checkInAppt ? 'checkin' : view.checkoutAppt ? 'checkout' : view.viewAppt ? 'details' : view.resolveAppt ? 'resolve' : view.rescheduleAppt ? 'reschedule' : null;

  const paneTitle = paneType === 'details' ? 'Visit Details' : paneType === 'checkin' ? 'Check In' : paneType === 'checkout' ? 'Checkout' : paneType === 'resolve' ? 'No-Show Resolution' : paneType === 'reschedule' ? 'Reschedule' : '';

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <button onClick={onClose} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-base font-medium text-foreground block truncate">
            {paneTitle}
          </span>
          <span className="text-[11px] text-muted-foreground block truncate">
            {appointment.patient?.firstName} {appointment.patient?.lastName} &mdash; {appointment.service?.name}
          </span>
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground shrink-0 max-lg:hidden">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {paneType === 'details' && <DetailsContent appointment={appointment} />}
        {paneType === 'checkin' && <CheckInContent appointment={appointment} view={view} onClose={onClose} />}
        {paneType === 'checkout' && <CheckoutContent appointment={appointment} view={view} onClose={onClose} />}
        {paneType === 'resolve' && <ResolveContent view={view} onClose={onClose} />}
        {paneType === 'reschedule' && <StandaloneReschedule view={view} onClose={onClose} />}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function InfoBox({ variant, title, children }: { variant: 'cyan' | 'amber' | 'emerald' | 'red'; title: string; children: React.ReactNode }) {
  const colors = {
    cyan: 'bg-cyan-500/5 border-cyan-500/20 text-cyan-600',
    amber: 'bg-amber-500/5 border-amber-500/20 text-amber-600',
    emerald: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600',
    red: 'bg-red-500/5 border-red-500/20 text-red-500',
  };
  return (
    <div className={`p-3 border ${colors[variant]}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider">{title}</span>
      <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

function DetailsContent({ appointment }: { appointment: any }) {
  return (
    <>
      <div className="flex flex-col gap-3 text-xs bg-muted/30 p-4 border border-card-border/40">
        <Row label="Patient" value={`${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`} />
        <Row label="Doctor" value={`Dr. ${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''}`} />
        <Row label="Service" value={appointment.service?.name || 'Procedure'} />
        <Row label="Date" value={appointment.date} />
        <Row label="Time" value={`${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`} />
        {appointment.statusReason && (
          <>
            <div className="border-t border-card-border/30 pt-2" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Completion Log</span>
              <span className="text-[11px] text-muted-foreground italic">{appointment.statusReason}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CheckInContent({ appointment, view, onClose }: { appointment: any; view: any; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">Check In Patient</h3>
        <p className="text-xs text-muted-foreground">
          Confirm arrival for {appointment.service?.name} with Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}.
        </p>
      </div>

      <InfoBox variant="cyan" title="Check-In Notice">
        Patient will be marked as present in clinic and moved to Checked In status.
      </InfoBox>

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => {
            view.handleCheckIn(appointment.id);
            view.setCheckInAppt(null);
          }}
          disabled={view.isPending}
          className="w-full h-10 text-sm font-medium bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border border-cyan-500/20 disabled:opacity-40 transition-colors"
        >
          {view.isPending ? 'Checking In...' : 'Confirm Check-In'}
        </button>
        <button
          onClick={onClose}
          className="w-full h-10 text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CheckoutContent({ appointment, view, onClose }: { appointment: any; view: any; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">Checkout Patient</h3>
        <p className="text-xs text-muted-foreground">
          Complete visit for {appointment.patient?.firstName} {appointment.patient?.lastName}. Treatment ({appointment.service?.name}) has been rendered.
        </p>
      </div>

      <InfoBox variant="amber" title="Automated Communication">
        Confirming checkout will finalize the visit and automatically send a Thank You and Post-Care Review Request message to the patient.
      </InfoBox>

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => view.handleCheckoutComplete(appointment.id)}
          disabled={view.isPending}
          className="w-full h-10 text-sm font-medium bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 disabled:opacity-40 transition-colors"
        >
          {view.isPending ? 'Processing...' : 'Confirm Checkout & Send'}
        </button>
        <button
          onClick={onClose}
          className="w-full h-10 text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ResolveContent({ view, onClose }: { view: any; onClose: () => void }) {
  const appointment = view.resolveAppt;
  const [resolution, setResolution] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE'>('COMPLETED');
  const [reason, setReason] = useState('Secretary forgot to click check-in');

  if (!appointment) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    view.handleResolveNoShowSubmit({
      appointmentId: appointment.id,
      resolution,
      reason: reason.trim(),
    });
  };

  const selectResolution = (val: 'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE', defaultReason: string) => {
    setResolution(val);
    setReason(defaultReason);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">No-Show Resolution</h3>
        <p className="text-xs text-muted-foreground">
          Original slot: {appointment.date} ({appointment.startTime?.substring(0, 5)} - {appointment.endTime?.substring(0, 5)})
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Resolution Action</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => selectResolution('COMPLETED', 'Secretary forgot to click check-in')}
            className={`p-2.5 border text-[10px] font-medium transition-all ${
              resolution === 'COMPLETED' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            Mark Completed
          </button>
          <button
            onClick={() => selectResolution('CONFIRMED_NO_SHOW', 'Patient failed to arrive for appointment')}
            className={`p-2.5 border text-[10px] font-medium transition-all ${
              resolution === 'CONFIRMED_NO_SHOW' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            Keep No-Show
          </button>
          <button
            onClick={() => selectResolution('RESCHEDULE', 'Patient arrived late; rescheduling to new slot')}
            className={`p-2.5 border text-[10px] font-medium transition-all ${
              resolution === 'RESCHEDULE' ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600' : 'border-card-border bg-card text-muted-foreground hover:border-foreground/30'
            }`}
          >
            Reschedule
          </button>
        </div>
      </div>

      {resolution === 'RESCHEDULE' ? (
        <AppointmentRescheduleForm
          appointment={appointment}
          services={view.servicesList || []}
          serviceId={appointment.serviceId}
          doctorId={view.rescheduleDoctor || appointment.doctorId}
          doctors={(view.doctorsList || []).map((d: any) => ({
            doctorId: d.id,
            doctorName: `${d.prefix || 'Dr.'} ${d.firstName} ${d.lastName}`,
          }))}
          date={view.rescheduleDate || ''}
          activeServiceId={appointment.serviceId}
          activeDoctorId={appointment.doctorId}
          startTime={view.rescheduleTime || ''}
          endTime={view.rescheduleEndTime || ''}
          justification={reason}
          isSubmitting={view.isPending}
          onServiceSelect={() => {}}
          onDoctorSelect={(docId) => view.setRescheduleDoctor(docId)}
          onDateSelect={(d) => view.setRescheduleDate(d)}
          onStartTimeChange={(t) => view.setRescheduleTime(t)}
          onEndTimeChange={(t) => view.setRescheduleEndTime?.(t)}
          onJustificationChange={(j) => setReason(j)}
          onSubmit={handleSubmit}
          onBack={onClose}
        />
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Reason for Resolution</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Provide reason for audit log..."
              className="w-full text-xs p-3 bg-card border border-card-border text-foreground outline-none focus:border-foreground/30 resize-none"
            />
          </div>

          {resolution === 'COMPLETED' && (
            <InfoBox variant="emerald" title="Auto-Communication">
              Will complete appointment and send Thank You and Post-Care Review Request message to patient.
            </InfoBox>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleSubmit}
              disabled={view.isPending || !reason.trim()}
              className={`w-full h-10 text-sm font-medium border disabled:opacity-40 transition-colors ${
                resolution === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'
              }`}
            >
              {view.isPending ? 'Submitting...' : 'Submit Resolution'}
            </button>
            <button
              onClick={onClose}
              className="w-full h-10 text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StandaloneReschedule({ view, onClose }: { view: any; onClose: () => void }) {
  const appointment = view.rescheduleAppt;
  if (!appointment) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">Reschedule Appointment</h3>
        <p className="text-xs text-muted-foreground">
          {appointment.patient?.firstName} {appointment.patient?.lastName} - {appointment.service?.name}
        </p>
      </div>

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
        onBack={onClose}
      />
    </div>
  );
}
