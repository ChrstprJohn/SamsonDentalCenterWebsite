'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime, formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { updateGuestContactAction } from '@/modules/appointments/actions/booking/update-guest-contact.action';
import { UserRound, Pencil, X, Check } from 'lucide-react';

interface SharedAppointmentDetailProps {
  appointment: AppointmentDto;
  extraSections?: ReactNode;
  actionsBar?: ReactNode;
}

export function SharedAppointmentDetail({ appointment, extraSections, actionsBar }: SharedAppointmentDetailProps) {
  const [patientProfile, setPatientProfile] = useState<{ email?: string; phoneNumber?: string } | null>(null);
  const [isEditingGuestInfo, setIsEditingGuestInfo] = useState(false);
  const [guestInfoDraft, setGuestInfoDraft] = useState({ firstName: '', middleName: '', lastName: '', suffix: '', email: '', phone: '' });
  const [savingGuestInfo, setSavingGuestInfo] = useState(false);

  const hasGuestInfo = !!appointment.guestContact;
  const isGuest = !appointment.patientId || appointment.source === 'STAFF_CREATED';

  const formatName = () => {
    if (appointment.dependent) {
      return `${appointment.dependent.firstName} ${appointment.dependent.lastName}`;
    }
    if (appointment.guestContact) {
      const initial = appointment.guestContact.middleName ? ` ${appointment.guestContact.middleName.charAt(0).toUpperCase()}.` : '';
      return `${appointment.guestContact.firstName || ''}${initial} ${appointment.guestContact.lastName || ''}`.trim() + (appointment.guestContact.suffix ? `, ${appointment.guestContact.suffix}` : '');
    }
    return appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Guest Patient';
  };

  const getFirstName = () => appointment.guestContact?.firstName || appointment.patient?.firstName || '-';
  const getMiddleName = () => appointment.guestContact?.middleName || '-';
  const getLastName = () => appointment.guestContact?.lastName || appointment.patient?.lastName || '-';
  const getSuffix = () => appointment.guestContact?.suffix || '-';
  const getEmail = () => appointment.guestContact?.email || patientProfile?.email || '-';
  const getPhone = () => appointment.guestContact?.phone || patientProfile?.phoneNumber || '-';

  const hasGuestInfoChanges = isEditingGuestInfo && (
    guestInfoDraft.firstName !== (appointment.guestContact?.firstName || '') ||
    guestInfoDraft.middleName !== (appointment.guestContact?.middleName || '') ||
    guestInfoDraft.lastName !== (appointment.guestContact?.lastName || '') ||
    guestInfoDraft.suffix !== (appointment.guestContact?.suffix || '') ||
    guestInfoDraft.email !== (appointment.guestContact?.email || '') ||
    guestInfoDraft.phone !== (appointment.guestContact?.phone || '')
  );

  const startEditGuestInfo = () => {
    if (!hasGuestInfo) return;
    setGuestInfoDraft({
      firstName: appointment.guestContact?.firstName || '',
      middleName: appointment.guestContact?.middleName || '',
      lastName: appointment.guestContact?.lastName || '',
      suffix: appointment.guestContact?.suffix || '',
      email: appointment.guestContact?.email || '',
      phone: appointment.guestContact?.phone || '',
    });
    setIsEditingGuestInfo(true);
  };

  const cancelEditGuestInfo = () => setIsEditingGuestInfo(false);

  const saveGuestInfo = async () => {
    setSavingGuestInfo(true);
    const res = await updateGuestContactAction({
      appointmentId: appointment.id,
      firstName: guestInfoDraft.firstName,
      middleName: guestInfoDraft.middleName,
      lastName: guestInfoDraft.lastName,
      suffix: guestInfoDraft.suffix,
      email: guestInfoDraft.email,
      phone: guestInfoDraft.phone,
    });
    if (res.success) {
      setIsEditingGuestInfo(false);
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
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
        {/* Profile */}
        <div className="flex flex-col items-center pt-6 pb-4 px-5">
          <div className="size-16 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
            <UserRound className="size-14 text-muted-foreground/70 translate-y-0.5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{formatName()}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{isGuest ? 'Guest' : 'Patient'}</p>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Current Status */}
        <div className="flex items-center justify-between py-4 px-5">
          <span className="text-base font-medium text-foreground">Current Status</span>
          <Badge variant={getBadgeVariant(appointment.status)} className="text-xs px-3 py-1">{appointment.status}</Badge>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Guest Information */}
        <div className="py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-foreground">Guest Information</span>
            {hasGuestInfo && !isEditingGuestInfo && (
              <Button variant="outline" size="sm" onClick={startEditGuestInfo} className="h-auto px-4 py-2 text-sm gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs">
                <Pencil className="size-4" /> Edit
              </Button>
            )}
            {isEditingGuestInfo && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={cancelEditGuestInfo} className="h-auto px-3 py-1.5 text-xs gap-1">
                  <X className="size-3.5" /> Cancel
                </Button>
                <Button size="sm" onClick={saveGuestInfo} disabled={savingGuestInfo || !hasGuestInfoChanges} className="h-auto px-3 py-1.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                  <Check className="size-3.5" /> {savingGuestInfo ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <GuestField label="First Name" value={getFirstName()} editValue={guestInfoDraft.firstName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, firstName: v }))} isEditing={isEditingGuestInfo} />
              <GuestField label="Last Name" value={getLastName()} editValue={guestInfoDraft.lastName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, lastName: v }))} isEditing={isEditingGuestInfo} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <GuestField label="Middle Name" value={getMiddleName()} editValue={guestInfoDraft.middleName} onChange={(v) => setGuestInfoDraft(p => ({ ...p, middleName: v }))} isEditing={isEditingGuestInfo} />
              <GuestField label="Suffix" value={getSuffix()} editValue={guestInfoDraft.suffix} onChange={(v) => setGuestInfoDraft(p => ({ ...p, suffix: v }))} isEditing={isEditingGuestInfo} />
            </div>
          </div>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Guest Contact */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Guest Contact</span>
          <div className="flex flex-col gap-3">
            <GuestField label="Email" value={getEmail()} editValue={guestInfoDraft.email} onChange={(v) => setGuestInfoDraft(p => ({ ...p, email: v }))} isEditing={isEditingGuestInfo} />
            <GuestField label="Phone" value={getPhone()} editValue={guestInfoDraft.phone} onChange={(v) => setGuestInfoDraft(p => ({ ...p, phone: v }))} isEditing={isEditingGuestInfo} />
          </div>
        </div>

        <hr className="border-card-border/40 mx-5" />

        {/* Service & Schedule */}
        <div className="py-4 px-5">
          <span className="text-base font-medium text-foreground block mb-3">Service & Schedule</span>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Service</span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{appointment.service?.name || 'Selected Treatment'}</div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Date</span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatShortDate(appointment.date)}</div>
            </div>
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
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Assign Dentist</span>
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">
                {appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '-'}
              </div>
            </div>
          </div>
        </div>

        {extraSections}
      </div>

      {actionsBar && (
        <div className="shrink-0 border-t border-border bg-sidebar p-4">
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
        <input value={editValue} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
      ) : (
        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{value}</div>
      )}
    </div>
  );
}

function getBadgeVariant(status: string) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'APPROVED') return 'info';
  if (status === 'NO_SHOW' || status === 'DISPLACED') return 'warning';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'error';
  return 'default';
}
