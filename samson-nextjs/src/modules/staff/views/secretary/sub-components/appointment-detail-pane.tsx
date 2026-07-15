'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { formatClinicTime, formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import { getPatientDetailsForStaffAction } from '@/modules/patients/actions/profile/get-patient-details-for-staff.action';
import { AppointmentCancelForm } from './appointment-cancel-form';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { User, Phone, Calendar, Clock, Stethoscope } from 'lucide-react';

interface AppointmentDetailPaneProps {
  view: any;
}

export function AppointmentDetailPane({ view }: AppointmentDetailPaneProps) {
  const appointment = view.selectedAppointment as AppointmentDto | undefined;
  return (
    <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
      {appointment ? <AppointmentDetails appointment={appointment} view={view} activeTab={view.activeTab} /> : (
        <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
          Select an appointment from the table to inspect details and history logs.
        </div>
      )}
    </div>
  );
}

function AppointmentDetails({ appointment, view, activeTab }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab }) {
  const [patientProfile, setPatientProfile] = useState<{ email?: string; phoneNumber?: string } | null>(null);

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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-card-border">
        <h2 className="text-sm font-bold text-text-primary tracking-wide">APPOINTMENT DETAIL</h2>
        <div className="flex gap-1.5">
          {(!appointment.patientId || appointment.source === 'STAFF_CREATED') && (
            <Badge variant="warning">GUEST</Badge>
          )}
          <Badge variant={appointment.status === 'APPROVED' ? 'success' : 'default'}>{appointment.status}</Badge>
        </div>
      </div>

      {/* Patient Info */}
      <Section icon={User} title="PATIENT INFO">
        <p className="text-sm font-semibold text-text-primary">
          {view.formatPatientName(appointment)}
        </p>
      </Section>

      {/* Contact Info */}
      {patientProfile && (
        <Section icon={Phone} title="CONTACT INFO">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="MOBILE NUMBER" value={patientProfile.phoneNumber || 'N/A'} />
            <InfoCard label="EMAIL ADDRESS" value={patientProfile.email || 'N/A'} />
          </div>
        </Section>
      )}

      {/* Schedule & Treatment */}
      <Section icon={Stethoscope} title="SCHEDULE & TREATMENT">
        <div className="flex flex-col gap-3">
          <InfoCard label="ASSIGNED TREATMENT" value={appointment.service?.name || 'Selected Treatment'} />

          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label="DATE"
              value={formatShortDate(appointment.date)}
              icon={<Calendar className="size-3.5 text-text-muted" />}
            />
            <InfoCard
              label="TIME SLOT"
              value={
                appointment.startTime && appointment.endTime
                  ? `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`
                  : appointment.preferredStartTime
                    ? `Pref: ${formatTimeString(appointment.preferredStartTime)}`
                    : 'Time Pending'
              }
              icon={<Clock className="size-3.5 text-text-muted" />}
            />
          </div>

          <InfoCard
            label="ASSIGNED PRACTITIONER"
            value={appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : '-'}
          />
        </div>
      </Section>

      {appointment.userNote && (
        <div className="bg-secondary-bg/25 p-3 rounded-xl border border-card-border/60">
          <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">Patient Remarks:</span>
          <span className="text-xs text-text-secondary italic">&quot;{appointment.userNote}&quot;</span>
        </div>
      )}

      {/* Actions */}
      {activeTab === 'upcoming' && !view.showRescheduleForm && !view.showCancelForm && (
        <div className="flex gap-2 pt-2">
          <Button onClick={() => view.setShowRescheduleForm(true)} className="text-xs py-1.5 flex-1 bg-primary text-white">
            Modify Schedule
          </Button>
          <Button onClick={() => view.setShowCancelForm(true)} variant="danger" className="text-xs py-1.5 flex-1 border border-red-500 text-red-500 hover:bg-red-500/10">
            Cancel Booking
          </Button>
        </div>
      )}

      {view.showRescheduleForm && <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} />}
      {view.showCancelForm && (
        <AppointmentCancelForm
          reasonPreset={view.cancelReasonPreset}
          setReasonPreset={view.setCancelReasonPreset}
          reasonCustom={view.cancelReasonCustom}
          setReasonCustom={view.setCancelReasonCustom}
          isSubmitting={view.isSubmitting}
          onSubmit={view.submitCancel}
          onBack={() => view.setShowCancelForm(false)}
        />
      )}
      <AppointmentStatusHistory appointment={appointment} activeTab={activeTab} />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="size-3.5 text-text-muted" />
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-secondary-bg/20 border border-card-border/60 rounded-xl p-3 flex flex-col gap-1">
      {icon ? (
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        </div>
      ) : (
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
      )}
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function getRescheduleProps(view: any) {
  return {
    changeTreatment: view.changeTreatment,
    services: view.services,
    serviceId: view.rescheduleServiceId,
    isLoadingServices: view.isLoadingServices,
    changeDoctor: view.changeDoctor,
    doctorId: view.rescheduleDoctorId,
    doctors: view.availableRescheduleDoctors,
    isLoadingDoctors: view.isLoadingRescheduleDoctors,
    month: view.rescheduleMonth,
    availableDates: view.availableDates,
    isLoadingDays: view.isLoadingDays,
    date: view.rescheduleDate,
    activeServiceId: view.activeServiceId,
    activeDoctorId: view.activeDoctorId,
    slots: view.timeslots,
    isLoadingSlots: view.isLoadingSlots,
    startTime: view.rescheduleStartTime,
    justification: view.rescheduleJustification,
    isSubmitting: view.isSubmitting,
    onToggleTreatment: view.toggleChangeTreatment,
    onServiceSelect: view.selectRescheduleService,
    onToggleDoctor: view.toggleChangeDoctor,
    onDoctorSelect: view.setRescheduleDoctorId,
    onMonthChange: view.setRescheduleMonth,
    onDateSelect: view.selectRescheduleDate,
    onSlotSelect: view.selectRescheduleSlot,
    onJustificationChange: view.setRescheduleJustification,
    onSubmit: view.submitReschedule,
    onBack: () => view.setShowRescheduleForm(false),
  };
}
