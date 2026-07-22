'use client';

import React, { useState, useEffect } from 'react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { updateGuestContactAction } from '@/modules/appointments/actions/booking/update-guest-contact.action';
import { resendReminderAction } from '@/modules/appointments/actions/status/resend-reminder.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { UserRound, Calendar, XCircle, CheckCircle, AlertCircle, Pencil, Check, X, ArrowLeft, Mail, Send } from 'lucide-react';
import { formatClinicTime } from '@/shared/utils/date.util';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InquiryToast } from './inquiry-toast';

const activeStates = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];

interface SidebarAppointmentDetailsProps {
  appointment: AppointmentDto;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SidebarAppointmentDetails({
  appointment,
  onClose,
  onSuccess,
}: SidebarAppointmentDetailsProps) {
  const [localAppointment, setLocalAppointment] = useState(appointment);
  const [doctors, setDoctors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [activeAction, setActiveAction] = useState<'NONE' | 'RESCHEDULE' | 'CANCEL'>('NONE');
  const [actionReason, setActionReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(appointment.date || '');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState(appointment.doctorId || '');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isEditingGuestInfo, setIsEditingGuestInfo] = useState(false);
  const [guestInfoDraft, setGuestInfoDraft] = useState({ firstName: '', middleName: '', lastName: '', suffix: '', email: '', phone: '' });
  const [savingGuestInfo, setSavingGuestInfo] = useState(false);
  const [resendingReminder, setResendingReminder] = useState<'24H' | '48H' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLocalAppointment(appointment);
    setIsEditingGuestInfo(false);
    setActiveAction('NONE');
    setActionReason('');
    setActionError(null);
    setActionSuccess(null);
  }, [appointment]);

  useEffect(() => {
    getDoctorsAction().then((res) => {
      if (res.success && res.data) setDoctors(res.data);
    });
  }, []);

  const formatPatientName = (app: AppointmentDto): string => {
    const formatNameWithMiddleAndSuffix = (first?: string | null, middle?: string | null, last?: string | null, suffix?: string | null) => {
      const initial = middle ? ` ${middle.charAt(0).toUpperCase()}.` : '';
      return `${first || ''}${initial} ${last || ''}`.trim() + (suffix ? `, ${suffix}` : '');
    };

    if (app.dependent) {
      const holder = app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Unknown';
      return `${app.dependent.firstName} ${app.dependent.lastName}`;
    }
    if (app.guestContact) {
      return formatNameWithMiddleAndSuffix(
        app.guestContact.firstName,
        app.guestContact.middleName,
        app.guestContact.lastName,
        app.guestContact.suffix
      );
    }
    if (app.source === 'STAFF_CREATED' && !app.patientId) {
      return `${app.patient?.firstName ?? 'Guest'} ${app.patient?.lastName ?? ''}`;
    }
    return app.patient ? `${app.patient.firstName} ${app.patient.lastName}` : 'Guest Patient';
  };

  const getPatientFirstName = () => localAppointment.guestContact?.firstName || localAppointment.patient?.firstName || '-';
  const getPatientMiddleName = () => localAppointment.guestContact?.middleName || '-';
  const getPatientLastName = () => localAppointment.guestContact?.lastName || localAppointment.patient?.lastName || '-';
  const getPatientSuffix = () => localAppointment.guestContact?.suffix || '-';
  const getPatientEmail = () => localAppointment.guestContact?.email || '-';
  const getPatientPhone = () => localAppointment.guestContact?.phone || '-';

  const patientName = formatPatientName(localAppointment);
  const serviceName = localAppointment.service?.name || 'Unassigned Service';
  const doctorName = localAppointment.doctor
    ? `Dr. ${localAppointment.doctor.firstName} ${localAppointment.doctor.lastName}`
    : 'No Doctor Assigned';
  const isActiveStatus = activeStates.includes(localAppointment.status);
  const hasGuestInfo = !!localAppointment.guestContact;

  const startEditGuestInfo = () => {
    if (!hasGuestInfo) return;
    setGuestInfoDraft({
      firstName: localAppointment.guestContact?.firstName || '',
      middleName: localAppointment.guestContact?.middleName || '',
      lastName: localAppointment.guestContact?.lastName || '',
      suffix: localAppointment.guestContact?.suffix || '',
      email: localAppointment.guestContact?.email || '',
      phone: localAppointment.guestContact?.phone || '',
    });
    setIsEditingGuestInfo(true);
  };

  const cancelEditGuestInfo = () => setIsEditingGuestInfo(false);

  const hasGuestInfoChanges = isEditingGuestInfo && (
    guestInfoDraft.firstName !== (localAppointment.guestContact?.firstName || '') ||
    guestInfoDraft.middleName !== (localAppointment.guestContact?.middleName || '') ||
    guestInfoDraft.lastName !== (localAppointment.guestContact?.lastName || '') ||
    guestInfoDraft.suffix !== (localAppointment.guestContact?.suffix || '') ||
    guestInfoDraft.email !== (localAppointment.guestContact?.email || '') ||
    guestInfoDraft.phone !== (localAppointment.guestContact?.phone || '')
  );

  const saveGuestInfo = async () => {
    setSavingGuestInfo(true);
    const res = await updateGuestContactAction({
      appointmentId: localAppointment.id,
      firstName: guestInfoDraft.firstName,
      middleName: guestInfoDraft.middleName,
      lastName: guestInfoDraft.lastName,
      suffix: guestInfoDraft.suffix,
      email: guestInfoDraft.email,
      phone: guestInfoDraft.phone,
    });
    if (res.success) {
      setLocalAppointment(prev => ({
        ...prev,
        guestContact: {
          firstName: guestInfoDraft.firstName,
          middleName: guestInfoDraft.middleName,
          lastName: guestInfoDraft.lastName,
          suffix: guestInfoDraft.suffix,
          email: guestInfoDraft.email,
          phone: guestInfoDraft.phone,
        }
      }));
      setIsEditingGuestInfo(false);
      showToast('Guest info updated successfully', 'success');
      if (onSuccess) onSuccess();
    } else {
      showToast(res.error || 'Failed to update guest info', 'error');
    }
    setSavingGuestInfo(false);
  };

  const handleManualResend = async (type: '24H' | '48H') => {
    setResendingReminder(type);
    const res = await resendReminderAction({
      appointmentId: localAppointment.id,
      reminderType: type,
    });
    if (res.success) {
      showToast(res.message || `${type} reminder sent successfully`, 'success');
      setLocalAppointment((prev) => ({
        ...prev,
        ...(type === '48H' ? { reminder48hSent: true } : { reminder24hSent: true }),
      }));
    } else {
      showToast(res.error || 'Failed to send reminder email', 'error');
    }
    setResendingReminder(null);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      let res;
      if (activeAction === 'RESCHEDULE') {
        if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime || !rescheduleDoctorId) {
          throw new Error('All rescheduling fields are required.');
        }
        if (!actionReason.trim()) throw new Error('A reason is required for rescheduling.');

        const startUtc = rescheduleStartTime.includes(':00') || rescheduleStartTime.split(':').length === 3
          ? `${rescheduleDate}T${rescheduleStartTime}Z`
          : `${rescheduleDate}T${rescheduleStartTime}:00Z`;
        const endUtc = rescheduleEndTime.includes(':00') || rescheduleEndTime.split(':').length === 3
          ? `${rescheduleDate}T${rescheduleEndTime}Z`
          : `${rescheduleDate}T${rescheduleEndTime}:00Z`;

        res = await updateAppointmentStatusAction({
          appointmentId: localAppointment.id,
          status: 'APPROVED',
          statusReason: actionReason,
          newDate: rescheduleDate,
          newStartTime: startUtc,
          newEndTime: endUtc,
          newDoctorId: rescheduleDoctorId,
          newServiceId: localAppointment.serviceId || undefined,
        });
      } else if (activeAction === 'CANCEL') {
        if (!actionReason.trim()) throw new Error('A cancellation reason is required.');
        res = await updateAppointmentStatusAction({
          appointmentId: localAppointment.id,
          status: 'CANCELLED',
          statusReason: actionReason,
        });
      }

      if (res && res.success) {
        setActionSuccess('Action executed successfully!');
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1500);
        setActiveAction('NONE');
        setActionReason('');
      } else {
        setActionError(res?.error || 'Action failed');
      }
    } catch (err: any) {
      setActionError(err.message || 'An unexpected error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr?: string | null) => {
    return formatClinicTime(timeStr ?? null) || 'TBD';
  };

  const GuestField = ({ label, value, editValue, onChange }: { label: string; value: string; editValue?: string; onChange?: (v: string) => void }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {isEditingGuestInfo && onChange ? (
        <input value={editValue} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
      ) : (
        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{value}</div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-4 flex items-center gap-2 border-b border-border bg-sidebar">
        <button onClick={onClose} className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex flex-col min-w-0">
          <h3 className="text-base font-medium text-foreground truncate">Appointment Detail</h3>
          <span className="text-[11px] text-muted-foreground truncate">Ref #{localAppointment.id.slice(0, 8)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        {/* Profile */}
        <div className="flex flex-col items-center pt-4 pb-4">
          <div className="size-16 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
            <UserRound className="size-14 text-muted-foreground/70 translate-y-0.5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{patientName}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{hasGuestInfo ? 'Guest' : 'Patient'}</p>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Current Status */}
        <div className="flex items-center justify-between py-4 px-5">
          <span className="text-base font-medium text-foreground">Current Status</span>
          <Badge variant={isActiveStatus ? 'success' : 'error'} className="text-xs px-3 py-1">
            {appointment.status}
          </Badge>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Guest Information */}
        <div className="py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-foreground">Guest Information</span>
            {hasGuestInfo && !isEditingGuestInfo && (
              <Button variant="outline" size="sm" onClick={startEditGuestInfo} className="h-7 px-2.5 text-xs gap-1">
                <Pencil className="size-3.5" /> Edit
              </Button>
            )}
            {isEditingGuestInfo && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={cancelEditGuestInfo} className="h-7 px-2.5 text-xs gap-1">
                  <X className="size-3.5" /> Cancel
                </Button>
                <Button size="sm" onClick={saveGuestInfo} disabled={savingGuestInfo || !hasGuestInfoChanges} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                  <Check className="size-3.5" /> {savingGuestInfo ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <GuestField label="First Name" value={getPatientFirstName()} editValue={guestInfoDraft.firstName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, firstName: v }))} />
            <GuestField label="Last Name" value={getPatientLastName()} editValue={guestInfoDraft.lastName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, lastName: v }))} />
            <GuestField label="Middle Name" value={getPatientMiddleName()} editValue={guestInfoDraft.middleName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, middleName: v }))} />
            <GuestField label="Suffix" value={getPatientSuffix()} editValue={guestInfoDraft.suffix} onChange={(v) => setGuestInfoDraft(p => ({ ...p, suffix: v }))} />
          </div>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Guest Contact */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Guest Contact</span>
          <div className="flex flex-col gap-3">
            <GuestField label="Email" value={getPatientEmail()} editValue={guestInfoDraft.email} onChange={(v) => setGuestInfoDraft(p => ({ ...p, email: v }))} />
            <GuestField label="Phone" value={getPatientPhone()} editValue={guestInfoDraft.phone} onChange={(v) => setGuestInfoDraft(p => ({ ...p, phone: v }))} />
          </div>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Service & Schedule */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Service & Schedule</span>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{serviceName}</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Date <span className="text-destructive">*</span></span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{new Date(localAppointment.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(localAppointment.startTime)}</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(localAppointment.endTime)}</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{doctorName}</div>
            </div>
          </div>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Reminders & Notifications Hub */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Notification Reminders</span>
          <div className="flex flex-col gap-3">
            {/* 48H Reminder Status */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-muted/30">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" /> 48-Hour Reminder
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Status: {localAppointment.reminder48hSent ? 'Sent / Processed' : 'Pending / Skipped'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs gap-1"
                disabled={resendingReminder === '48H'}
                onClick={() => handleManualResend('48H')}
              >
                <Send className="size-3" />
                {resendingReminder === '48H' ? 'Sending...' : 'Resend'}
              </Button>
            </div>

            {/* 24H Reminder Status */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-muted/30">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" /> 24-Hour Reminder
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Status: {localAppointment.reminder24hSent ? 'Sent / Processed' : 'Pending / Skipped'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs gap-1"
                disabled={resendingReminder === '24H'}
                onClick={() => handleManualResend('24H')}
              >
                <Send className="size-3" />
                {resendingReminder === '24H' ? 'Sending...' : 'Resend'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border bg-sidebar shrink-0">
        {actionError && (
          <div className="p-3 mb-3 rounded-lg bg-destructive/10 border border-destructive/20 text-[10px] text-destructive flex items-start gap-2">
            <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="p-3 mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 flex items-start gap-2">
            <CheckCircle className="size-3.5 mt-0.5 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {activeAction === 'NONE' ? (
          <div className="w-full">
            {isActiveStatus ? (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setActiveAction('RESCHEDULE');
                  
                  const parseTimeToHHMM = (timeStr?: string | null) => {
                    if (!timeStr) return '';
                    if (timeStr.includes('T')) {
                      const timePart = timeStr.split('T')[1];
                      if (timePart) return timePart.slice(0, 5);
                    }
                    const match = timeStr.match(/^(\d{2}):(\d{2})/);
                    if (match) return `${match[1]}:${match[2]}`;
                    return '';
                  };
                  
                  setRescheduleStartTime(parseTimeToHHMM(appointment.startTime));
                  setRescheduleEndTime(parseTimeToHHMM(appointment.endTime));
                  setActionError(null);
                  setActionSuccess(null);
                }}>
                  <Calendar className="size-4" /> Reschedule
                </Button>
                <Button onClick={() => { setActiveAction('CANCEL'); setActionError(null); setActionSuccess(null); }} variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10">
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-muted border border-border rounded-xl text-center text-xs text-muted-foreground">
                Action disabled
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleActionSubmit} className="space-y-3 bg-card/60 p-4 rounded-xl border border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              {activeAction === 'RESCHEDULE' ? <Calendar className="size-3" /> : <XCircle className="size-3" />}
              {activeAction === 'RESCHEDULE' ? 'Reschedule Slot' : 'Cancel Booking'}
            </p>

            {activeAction === 'RESCHEDULE' && (
              <div className="space-y-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-muted-foreground">New Date</label>
                  <Input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs text-muted-foreground">Start Time</label>
                    <Input type="time" value={rescheduleStartTime} onChange={e => setRescheduleStartTime(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs text-muted-foreground">End Time</label>
                    <Input type="time" value={rescheduleEndTime} onChange={e => setRescheduleEndTime(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs text-muted-foreground">Assign Doctor</label>
                  <Select value={rescheduleDoctorId} onChange={e => setRescheduleDoctorId(e.target.value)} options={[{ value: '', label: 'Select Doctor...' }, ...doctors.map(d => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName}` }))]} />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-muted-foreground">Reason / Notes</label>
              <Textarea value={actionReason} onChange={e => setActionReason(e.target.value)} placeholder="Provide reason..." className="min-h-[60px] resize-none" required />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={() => setActiveAction('NONE')} variant="outline" size="sm" className="flex-1">Cancel</Button>
              <Button type="submit" disabled={actionLoading} size="sm" className="flex-1">{actionLoading ? 'Saving...' : 'Confirm'}</Button>
            </div>
          </form>
        )}
      </div>
      <InquiryToast toast={toast} />
    </div>
  );
}
