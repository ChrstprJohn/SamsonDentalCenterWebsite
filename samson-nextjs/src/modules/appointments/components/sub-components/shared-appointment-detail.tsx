'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime, formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { updateGuestContactAction } from '@/modules/appointments/actions/booking/update-guest-contact.action';
import { UserRound, Pencil, X, Check } from 'lucide-react';

/**
 * SharedAppointmentDetail - Core appointment details overview content.
 * 
 * Layout & Background Styling Rules:
 * - `compact={true}` (Calendar & Chat): Action bar uses `bg-sidebar` to match sidebar layout.
 * - `compact={false}` (Appointment Directory): Action bar uses `bg-card` (white) for main panel styling.
 */
interface SharedAppointmentDetailProps {
  appointment: AppointmentDto;
  extraSections?: ReactNode;
  actionsBar?: ReactNode;
  compact?: boolean;
  onAppointmentUpdated?: (updatedAppointment?: AppointmentDto) => void;
}

export function SharedAppointmentDetail({ appointment, extraSections, actionsBar, compact, onAppointmentUpdated }: SharedAppointmentDetailProps) {
  const [localAppointment, setLocalAppointment] = useState<AppointmentDto>(appointment);
  const [patientProfile, setPatientProfile] = useState<{ email?: string; phoneNumber?: string } | null>(null);
  const [isEditingGuestInfo, setIsEditingGuestInfo] = useState(false);
  const [guestInfoDraft, setGuestInfoDraft] = useState({ firstName: '', middleName: '', lastName: '', suffix: '', email: '', phone: '' });
  const [savingGuestInfo, setSavingGuestInfo] = useState(false);

  useEffect(() => {
    setLocalAppointment(appointment);
  }, [appointment]);

  const hasGuestInfo = !!localAppointment.guestContact;
  const isGuest = !localAppointment.patientId || localAppointment.source === 'STAFF_CREATED' || localAppointment.source === 'CONVERTED';

  const formatName = () => {
    if (localAppointment.dependent) {
      return `${localAppointment.dependent.firstName} ${localAppointment.dependent.lastName}`;
    }
    if (localAppointment.guestContact) {
      const initial = localAppointment.guestContact.middleName ? ` ${localAppointment.guestContact.middleName.charAt(0).toUpperCase()}.` : '';
      return `${localAppointment.guestContact.firstName || ''}${initial} ${localAppointment.guestContact.lastName || ''}`.trim() + (localAppointment.guestContact.suffix ? `, ${localAppointment.guestContact.suffix}` : '');
    }
    return localAppointment.patient ? `${localAppointment.patient.firstName} ${localAppointment.patient.lastName}` : 'Guest Patient';
  };

  const getFirstName = () => localAppointment.guestContact?.firstName || localAppointment.patient?.firstName || '-';
  const getMiddleName = () => localAppointment.guestContact?.middleName || '-';
  const getLastName = () => localAppointment.guestContact?.lastName || localAppointment.patient?.lastName || '-';
  const getSuffix = () => localAppointment.guestContact?.suffix || '-';
  const getEmail = () => localAppointment.guestContact?.email || patientProfile?.email || '-';
  const getPhone = () => localAppointment.guestContact?.phone || patientProfile?.phoneNumber || '-';

  const hasGuestInfoChanges = isEditingGuestInfo && (
    guestInfoDraft.firstName !== (localAppointment.guestContact?.firstName || '') ||
    guestInfoDraft.middleName !== (localAppointment.guestContact?.middleName || '') ||
    guestInfoDraft.lastName !== (localAppointment.guestContact?.lastName || '') ||
    guestInfoDraft.suffix !== (localAppointment.guestContact?.suffix || '') ||
    guestInfoDraft.email !== (localAppointment.guestContact?.email || '') ||
    guestInfoDraft.phone !== (localAppointment.guestContact?.phone || '')
  );

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
      setLocalAppointment((prev) => ({
        ...prev,
        guestContact: {
          ...prev.guestContact,
          firstName: guestInfoDraft.firstName,
          middleName: guestInfoDraft.middleName || null,
          lastName: guestInfoDraft.lastName,
          suffix: guestInfoDraft.suffix || null,
          email: guestInfoDraft.email || null,
          phone: guestInfoDraft.phone,
        },
      }));
      setIsEditingGuestInfo(false);
      if (onAppointmentUpdated) {
        onAppointmentUpdated();
      }
    }
    setSavingGuestInfo(false);
  };

  useEffect(() => {
    if (!appointment.patientId) return;
    getPatientDetailsForStaffAction(appointment.patientId, appointment.dependentId || undefined)
      .then((res) => {
        if (res.success && res.data) {
          setPatientProfile({
            email: res.data.profile.email,
            phoneNumber: res.data.profile.phoneNumber,
          });
        }
      })
      .catch(() => {});
  }, [appointment.patientId, appointment.dependentId]);

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
        <div className="flex flex-col items-center pt-4 pb-3 px-4">
          <div className="size-12 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
            <UserRound className="size-10 text-muted-foreground/70 translate-y-0.5" />
          </div>
          <h2 className="text-base font-semibold text-foreground">{formatName()}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{isGuest ? 'Guest' : 'Patient'}</p>
        </div>

        <hr className="border-card-border/40 mx-4" />

        <div className="flex items-center justify-between py-3 px-4">
          <span className="text-sm font-medium text-foreground">Current Status</span>
          <Badge variant={getBadgeVariant(appointment.status)} className="text-xs px-3 py-1">{appointment.status === 'APPROVED' ? 'Confirmed / Approved' : appointment.status}</Badge>
        </div>
        <div className="flex items-center justify-between py-3 px-4 border-t border-card-border/40">
          <span className="text-sm font-medium text-foreground">Source</span>
          <Badge variant={sourcePillVariant(appointment.source)} className="text-xs px-3 py-1">
            {sourcePillLabel(appointment.source)}
          </Badge>
        </div>

        <hr className="border-card-border/40 mx-4" />

        <div className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Guest Information</span>
            {hasGuestInfo && !isEditingGuestInfo && !['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(appointment.status) && (
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
            <GuestField label="First Name" value={getFirstName()} editValue={guestInfoDraft.firstName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, firstName: v }))} isEditing={isEditingGuestInfo} />
            <GuestField label="Last Name" value={getLastName()} editValue={guestInfoDraft.lastName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, lastName: v }))} isEditing={isEditingGuestInfo} />
            <div className="grid grid-cols-2 gap-2">
              <GuestField label="Middle Name" value={getMiddleName()} editValue={guestInfoDraft.middleName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, middleName: v }))} isEditing={isEditingGuestInfo} />
              <GuestField label="Suffix" value={getSuffix()} editValue={guestInfoDraft.suffix} onChange={(v) => setGuestInfoDraft(p => ({ ...p, suffix: v }))} isEditing={isEditingGuestInfo} />
            </div>
          </div>
        </div>

        <hr className="border-card-border/40 mx-4" />

        <div className="py-3 px-4">
          <span className="text-sm font-medium text-foreground block mb-2">Guest Contact</span>
          <div className="flex flex-col gap-2">
            <GuestField label="Email" value={getEmail()} editValue={guestInfoDraft.email} onChange={(v) => setGuestInfoDraft(p => ({ ...p, email: v }))} isEditing={isEditingGuestInfo} />
            <GuestField label="Phone" value={getPhone()} editValue={guestInfoDraft.phone} onChange={(v) => setGuestInfoDraft(p => ({ ...p, phone: v }))} isEditing={isEditingGuestInfo} />
          </div>
        </div>

        <hr className="border-card-border/40 mx-4" />

        <div className="py-3 px-4">
          <span className="text-sm font-medium text-foreground block mb-2">Service &amp; Schedule</span>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Service</span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{appointment.service?.name || 'Selected Treatment'}</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Date</span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatShortDate(appointment.date)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Start Time</span>
                <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
                  {appointment.startTime ? formatClinicTime(appointment.startTime) : appointment.preferredStartTime ? `Pref: ${formatTimeString(appointment.preferredStartTime)}` : '-'}
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">End Time</span>
                <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{appointment.endTime ? formatClinicTime(appointment.endTime) : '-'}</div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Assign Dentist</span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
                {appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '-'}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-card-border/40 mx-4" />

        <div className="py-3 px-4">
          <span className="text-sm font-medium text-foreground block mb-2">Patient Notes</span>
          <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground leading-relaxed border-card-border cursor-default min-h-[42px] whitespace-pre-wrap">
            {appointment.userNote || (appointment as any).user_note || appointment.statusReason || (appointment as any).status_reason || 'No notes provided.'}
          </div>
        </div>

        {extraSections}
      </div>

      {actionsBar && (
        <div className={`shrink-0 border-t border-border ${compact ? 'p-3 bg-sidebar' : 'p-4 bg-card'}`}>
          {actionsBar}
        </div>
      )}
    </div>
  );
}

function GuestField({ label, value, editValue, onChange, isEditing }: { label: string; value: string; editValue?: string; onChange?: (v: string) => void; isEditing: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {isEditing && onChange ? (
        <input value={editValue} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground leading-5 focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
      ) : (
        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground leading-5 border-card-border cursor-default">{value}</div>
      )}
    </div>
  );
}

function getBadgeVariant(status: string) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'APPROVED') return 'info';
  if (status === 'CHECKED_IN') return 'cyan';
  if (status === 'NO_SHOW' || status === 'DISPLACED') return 'warning';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'error';
  return 'default';
}

function sourcePillLabel(source: string): string {
  if (source === 'CONVERTED') return 'From Online Request';
  if (source === 'STAFF_CREATED') return 'From Manual Booking';
  return 'From Online Booking';
}

function sourcePillVariant(source: string): 'violet' | 'cyan' | 'success' {
  if (source === 'CONVERTED') return 'violet';
  if (source === 'STAFF_CREATED') return 'cyan';
  return 'success';
}
