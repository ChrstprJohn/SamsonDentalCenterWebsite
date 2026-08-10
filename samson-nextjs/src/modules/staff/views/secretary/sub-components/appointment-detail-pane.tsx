'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, User, Bell, History, CalendarDays } from 'lucide-react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { SharedAppointmentDetail } from '@/modules/appointments/components/sub-components/shared-appointment-detail';
import { AppointmentCancelForm, isCancelFormComplete } from './appointment-cancel-form';
import { AppointmentRescheduleForm, isRescheduleFormComplete } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { AppointmentNotificationsTab } from './appointment-notifications-tab';
import { getTodayLocalDateStr } from '@/shared/utils/date.util';

/**
 * AppointmentDetailPane - Shared appointment details panel.
 * 
 * Layout & Background Styling Rules:
 * - Calendar & Chat views pass `compact={true}`: Tabs sub-header and sticky bottom action containers use `bg-sidebar` to seamlessly blend into sidebar containers.
 * - Appointment Directory view passes `compact={false}` (default): Tabs sub-header and sticky bottom action containers use `bg-card` (white) for standard main panel styling.
 */
interface AppointmentDetailPaneProps {
  view: any;
  compact?: boolean;
  appointment?: AppointmentDto;
  activeTab?: AppointmentDirectoryTab;
  hideActions?: boolean;
  onAppointmentUpdated?: () => void;
  onEditingGuestInfoChange?: (isEditing: boolean) => void;
}

export function AppointmentDetailPane({ view, compact, appointment: appointmentOverride, activeTab: activeTabOverride, hideActions, onAppointmentUpdated, onEditingGuestInfoChange }: AppointmentDetailPaneProps) {
  const appointment = appointmentOverride || (view.selectedAppointment as AppointmentDto | undefined);
  if (!appointment) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
          <Calendar className="size-6 text-muted-foreground/60" />
        </div>
        <p className="text-xs font-medium text-foreground">No appointment selected</p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">
          Select an appointment from the list to view details.
        </p>
      </div>
    );
  }
  return <AppointmentDetails appointment={appointment} view={view} activeTab={activeTabOverride || view.activeTab || 'upcoming'} compact={compact} hideActions={hideActions} onAppointmentUpdated={onAppointmentUpdated} onEditingGuestInfoChange={onEditingGuestInfoChange} />;
}

// ponytail: same slot-past semantics as check-in board, but tolerant of
// HH:mm, HH:mm:ss, ISO, or missing endTime (falls back to startTime + duration).
function getSlotEnd(appointment: AppointmentDto): Date | null {
  const { date, endTime, startTime, service } = appointment;
  if (!date) return null;
  const toHHMM = (v: string | null) => (v ? (v.includes('T') ? v.slice(11, 16) : v.slice(0, 5)) : '');
  const build = (t: string) => {
    const d = new Date(`${date}T${t}:00+08:00`);
    return isNaN(d.getTime()) ? null : d;
  };
  const end = build(toHHMM(endTime));
  if (end) return end;
  const start = build(toHHMM(startTime));
  return start ? new Date(start.getTime() + (service?.durationMinutes || 30) * 60000) : null;
}

function AppointmentDetails({ appointment, view, activeTab, compact, hideActions, onAppointmentUpdated, onEditingGuestInfoChange }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab; compact?: boolean; hideActions?: boolean; onAppointmentUpdated?: () => void; onEditingGuestInfoChange?: (isEditing: boolean) => void }) {
  const router = useRouter();
  const [detailTab, setDetailTab] = useState<'overview' | 'notifications' | 'timeline'>('overview');
  const [isEditingChannel, setIsEditingChannel] = useState(false);

  const handleEditChange = (isEditing: boolean) => {
    onEditingGuestInfoChange?.(isEditing);
  };

  const handleChannelEditChange = (isEditing: boolean) => {
    setIsEditingChannel(isEditing);
    onEditingGuestInfoChange?.(isEditing);
  };

  const canModify = ['APPROVED', 'PENDING', 'RESCHEDULE_REQUESTED', 'DISPLACED'].includes(appointment.status);
  const canRescheduleOnly = appointment.status === 'NO_SHOW';
  const todayStr = getTodayLocalDateStr();
  // ponytail: same slot-past check as check-in board
  const slotEnd = getSlotEnd(appointment);
  const isPastEnd = !!slotEnd && new Date() > slotEnd;
  const isNoShowCandidate = appointment.status === 'NO_SHOW' || (appointment.status === 'APPROVED' && isPastEnd);
  const isResolvedNoShow = appointment.status === 'NO_SHOW' && !!appointment.noShowResolvedAt;
  // ponytail: past-day resolve lands on v2 directory (v1 lacks SidebarProvider and crashes), Unresolved tab preselected
  const resolveTarget = appointment.date === todayStr ? '/secretary-v2/check-in' : '/secretary-v2/appointments?tab=needs-attention';

  const TABS = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'notifications' as const, label: 'Notifications' },
    { key: 'timeline' as const, label: 'Timeline' },
  ];

  const activeIndex = TABS.findIndex((t) => t.key === detailTab);

  const [tabOffsets, setTabOffsets] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const tabRefs = useMemo(() => TABS.map(() => ({ current: null as HTMLButtonElement | null })), []);

  useEffect(() => {
    const currentBtn = tabRefs[activeIndex]?.current;
    if (currentBtn) {
      setTabOffsets({
        left: currentBtn.offsetLeft,
        width: currentBtn.offsetWidth,
      });
    }
  }, [activeIndex, tabRefs]);

  if (view.showRescheduleForm && (canModify || canRescheduleOnly)) {
    const isFormComplete = isRescheduleFormComplete({
      serviceId: view.rescheduleServiceId || appointment.serviceId,
      doctorId: (view.rescheduleDoctor ?? view.rescheduleDoctorId) || appointment.doctorId,
      date: view.rescheduleDate,
      startTime: view.rescheduleTime ?? view.rescheduleStartTime,
      endTime: view.rescheduleEndTime,
      justification: view.rescheduleJustification,
    });
    return (
      <div className="flex flex-col flex-1 min-h-0 h-full">
        <div className="flex-1 min-h-0 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
          <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} noFooter />
        </div>
        <div className={`shrink-0 border-t border-border px-4 py-3 ${compact ? 'bg-sidebar' : 'bg-card'}`}>
          <div className="flex flex-col gap-2">
            {isEditingChannel && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
                Please finish editing or save notification channel before taking action.
              </p>
            )}
            <div className={`flex gap-2 ${isEditingChannel ? 'pointer-events-none opacity-40' : ''}`}>
              <Button onClick={view.submitReschedule} disabled={view.isSubmitting || !isFormComplete} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-50">
                {view.isSubmitting ? 'Saving...' : 'Confirm'}
              </Button>
              <Button variant="outline" onClick={() => view.setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium rounded-xl">
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view.showCancelForm && (canModify || appointment.status === 'CHECKED_IN')) {
    const isCancelValid = isCancelFormComplete({
      reasonPreset: view.cancelReasonPreset,
      reasonCustom: view.cancelReasonCustom,
    });
    return (
      <div className="flex flex-col flex-1 min-h-0 h-full">
        <div className="flex-1 min-h-0 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
          <AppointmentCancelForm
            reasonPreset={view.cancelReasonPreset}
            appointmentId={appointment.id}
            setReasonPreset={view.setCancelReasonPreset}
            reasonCustom={view.cancelReasonCustom}
            setReasonCustom={view.setCancelReasonCustom}
            confirmationChannel={view.confirmationChannel}
            onConfirmationChannelChange={view.setConfirmationChannel}
            isSubmitting={view.isSubmitting}
            onSubmit={view.submitCancel}
            onBack={() => view.setShowCancelForm(false)}
            noFooter
          />
        </div>
        <div className={`shrink-0 border-t border-border px-4 py-3 ${compact ? 'bg-sidebar' : 'bg-card'}`}>
          <div className="flex flex-col gap-2">
            {isEditingChannel && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
                Please finish editing or save notification channel before taking action.
              </p>
            )}
            <div className={`flex gap-2 ${isEditingChannel ? 'pointer-events-none opacity-40' : ''}`}>
              <Button
                onClick={view.submitCancel}
                disabled={view.isSubmitting || !isCancelValid}
                className="flex-1 h-[42px] text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors rounded-xl disabled:opacity-50"
              >
                {view.isSubmitting ? 'Canceling...' : 'Confirm Cancellation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => view.setShowCancelForm(false)}
                className="flex-1 h-[42px] text-sm font-medium rounded-xl"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Sub-Header Tabs */}
      <div className={`shrink-0 border-b border-card-border/40 ${compact ? 'px-2.5 xl:px-4 bg-sidebar' : 'px-5 bg-card'}`}>
        <div className="relative flex gap-6">
          {TABS.map((tab, idx) => {
            const isActive = detailTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => { tabRefs[idx].current = el; }}
                onClick={() => setDetailTab(tab.key)}
                className={`py-2 xl:py-2.5 text-xs xl:text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          {/* Sliding underline indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{
              left: `${tabOffsets.left}px`,
              width: `${tabOffsets.width}px`,
            }}
          />
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        {detailTab === 'overview' && (
          <SharedAppointmentDetail
            appointment={appointment}
            compact={compact}
            onEditingGuestInfoChange={handleEditChange}
            actionsBar={!hideActions && (() => {
              const isCheckedIn = appointment.status === 'CHECKED_IN';
              if (activeTab === 'history') {
                const patientId = appointment.patientId || appointment.patient?.id || '';
                const serviceId = appointment.serviceId || '';
                const patientFirstName = appointment.dependent?.firstName || appointment.patient?.firstName || appointment.guestContact?.firstName || 'Patient';
                return (
                  <Button
                    variant="outline"
                    className="w-full h-[42px] gap-2 text-xs font-semibold rounded-xl hover:bg-muted/50 transition-colors border-primary/30 text-primary hover:text-primary"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (patientId) params.set('patientId', patientId);
                      if (serviceId) params.set('serviceId', serviceId);
                      router.push(`/secretary-v2/book?${params.toString()}`);
                    }}
                  >
                    <CalendarDays className="size-4" />
                    Book New Appointment for {patientFirstName}
                  </Button>
                );
              }
              if (!canModify && !canRescheduleOnly && !isCheckedIn && !isNoShowCandidate) return null;

              if (!view.showRescheduleForm && !view.showCancelForm) {
                return (
                  <div className="flex flex-col gap-2">
                    {isEditingChannel && (
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
                        Please finish editing or save notification channel before taking action.
                      </p>
                    )}
                    <div className={`flex gap-2 ${isEditingChannel ? 'pointer-events-none opacity-40' : ''}`}>
                      {(isNoShowCandidate || (isCheckedIn && isPastEnd)) && !isResolvedNoShow && (
                        <Button className="flex-1 h-[42px] bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push(resolveTarget)}>
                          {resolveTarget.startsWith('/secretary-v2/appointments') ? 'Go to Unresolved' : 'Go to Check-in Board'}
                        </Button>
                      )}
                      {isResolvedNoShow && (
                        <div className="w-full flex items-center justify-center text-[11px] text-muted-foreground py-2">
                          No-show resolved — audit record in History
                        </div>
                      )}
                      {canModify && !isPastEnd && (
                        <Button variant="outline" className="flex-1 h-[42px]" onClick={() => view.setShowRescheduleForm(true)}>
                          Reschedule
                        </Button>
                      )}
                      {canModify && !isPastEnd && (
                        <Button variant="outline" className="flex-1 h-[42px] border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => view.setShowCancelForm(true)}>
                          Cancel
                        </Button>
                      )}
                      {isCheckedIn && !isPastEnd && (
                        <Button className="flex-1 h-[42px] bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push('/secretary-v2/check-in')}>
                          Go to Check-in &amp; Checkout
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {view.showRescheduleForm && (canModify || canRescheduleOnly) && (
                    <>
                      <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} noFooter />
                      <div className="flex gap-2">
                        <Button onClick={view.handleRescheduleSubmit} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                          {view.isPending ? 'Saving...' : 'Confirm'}
                        </Button>
                        <Button variant="outline" onClick={() => view.setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium rounded-xl">
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                  {view.showCancelForm && (canModify || isCheckedIn) && (
                    <>
                      <AppointmentCancelForm
                        reasonPreset={view.cancelReasonPreset}
                        appointmentId={appointment.id}
                        setReasonPreset={view.setCancelReasonPreset}
                        reasonCustom={view.cancelReasonCustom}
                        setReasonCustom={view.setCancelReasonCustom}
                        confirmationChannel={view.confirmationChannel}
                        onConfirmationChannelChange={view.setConfirmationChannel}
                        isSubmitting={view.isPending}
                        onSubmit={view.handleCancelSubmit}
                        onBack={() => view.setShowCancelForm(false)}
                        noFooter
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={view.handleCancelSubmit}
                          disabled={view.isPending || !isCancelFormComplete({ reasonPreset: view.cancelReasonPreset, reasonCustom: view.cancelReasonCustom })}
                          className="flex-1 h-[42px] text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors rounded-xl disabled:opacity-40"
                        >
                          {view.isPending ? 'Canceling...' : 'Confirm Cancellation'}
                        </Button>
                        <Button variant="outline" onClick={() => view.setShowCancelForm(false)} className="flex-1 h-[42px] text-sm font-medium rounded-xl">
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
            onAppointmentUpdated={() => {
              if (onAppointmentUpdated) {
                onAppointmentUpdated();
              } else if (view?.onAppointmentUpdated) {
                view.onAppointmentUpdated();
              } else if (view?.refreshAppointment) {
                view.refreshAppointment();
              } else if (view?.fetchData) {
                view.fetchData({ force: true });
              }
            }}
          />
        )}

        {detailTab === 'notifications' && (
          <AppointmentNotificationsTab
            appointment={appointment}
            view={view}
            compact={compact}
            onEditingChannelChange={handleChannelEditChange}
          />
        )}

        {detailTab === 'timeline' && (
          <AppointmentStatusHistory appointment={appointment} activeTab={activeTab} compact={compact} />
        )}
      </div>

      {/* Sticky Bottom Actions Bar for non-overview tabs */}
      {detailTab !== 'overview' && !hideActions && (() => {
        const isCheckedIn = appointment.status === 'CHECKED_IN';
        if (activeTab === 'history') {
          const patientId = appointment.patientId || appointment.patient?.id || '';
          const serviceId = appointment.serviceId || '';
          const patientFirstName = appointment.dependent?.firstName || appointment.patient?.firstName || appointment.guestContact?.firstName || 'Patient';
          return (
            <div className={`shrink-0 border-t border-border ${compact ? 'p-3 bg-sidebar' : 'p-4 bg-card'}`}>
              <Button
                variant="outline"
                className="w-full h-[42px] gap-2 text-xs font-semibold rounded-xl hover:bg-muted/50 transition-colors border-primary/30 text-primary hover:text-primary"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (patientId) params.set('patientId', patientId);
                  if (serviceId) params.set('serviceId', serviceId);
                  router.push(`/secretary-v2/book?${params.toString()}`);
                }}
              >
                <CalendarDays className="size-4" />
                Book New Appointment for {patientFirstName}
              </Button>
            </div>
          );
        }
        if (!canModify && !canRescheduleOnly && !isCheckedIn && !isNoShowCandidate) return null;

        if (!view.showRescheduleForm && !view.showCancelForm) {
          return (
            <div className={`shrink-0 border-t border-border ${compact ? 'p-3 bg-sidebar' : 'p-4 bg-card'}`}>
              {isEditingChannel && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center mb-3">
                  Please finish editing or save notification channel before taking action.
                </p>
              )}
              <div className={`flex gap-2 ${isEditingChannel ? 'pointer-events-none opacity-40' : ''}`}>
                {(isNoShowCandidate || (isCheckedIn && isPastEnd)) && !isResolvedNoShow && (
                  <Button className="flex-1 h-[42px] bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push(resolveTarget)}>
                    {resolveTarget.startsWith('/secretary-v2/appointments') ? 'Go to Unresolved' : 'Go to Check-in Board'}
                  </Button>
                )}
                {isResolvedNoShow && (
                  <div className="w-full flex items-center justify-center text-[11px] text-muted-foreground py-2">
                    No-show resolved — audit record in History
                  </div>
                )}
                {canModify && !isPastEnd && (
                  <Button variant="outline" className="flex-1 h-[42px]" onClick={() => view.setShowRescheduleForm(true)}>
                    Reschedule
                  </Button>
                )}
                {canModify && !isPastEnd && (
                  <Button variant="outline" className="flex-1 h-[42px] border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => view.setShowCancelForm(true)}>
                    Cancel
                  </Button>
                )}
                {isCheckedIn && !isPastEnd && (
                  <Button className="flex-1 h-[42px] bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push('/secretary-v2/check-in')}>
                    Go to Check-in &amp; Checkout
                  </Button>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className={`shrink-0 border-t border-border ${compact ? 'p-3 bg-sidebar' : 'p-4 bg-card'}`}>
            <div className="space-y-3">
              {view.showRescheduleForm && (canModify || canRescheduleOnly) && (
                <>
                  <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} noFooter />
                  <div className="flex gap-2">
                    <Button onClick={view.handleRescheduleSubmit} disabled={view.isPending} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40">
                      {view.isPending ? 'Saving...' : 'Confirm'}
                    </Button>
                    <Button variant="outline" onClick={() => view.setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </>
              )}
              {view.showCancelForm && (canModify || isCheckedIn) && (
                <AppointmentCancelForm
                  reasonPreset={view.cancelReasonPreset}
                  appointmentId={appointment.id}
                  setReasonPreset={view.setCancelReasonPreset}
                  reasonCustom={view.cancelReasonCustom}
                  setReasonCustom={view.setCancelReasonCustom}
                  confirmationChannel={view.confirmationChannel}
                  onConfirmationChannelChange={view.setConfirmationChannel}
                  isSubmitting={view.isSubmitting}
                  onSubmit={view.submitCancel}
                  onBack={() => view.setShowCancelForm(false)}
                />
              )}
            </div>
          </div>
        );
      })()}
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
    doctorId: view.rescheduleDoctor ?? view.rescheduleDoctorId,
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
    startTime: view.rescheduleTime ?? view.rescheduleStartTime,
    endTime: view.rescheduleEndTime,
    confirmationChannel: view.confirmationChannel,
    onConfirmationChannelChange: view.setConfirmationChannel,
    justification: view.rescheduleJustification,
    isSubmitting: view.isSubmitting,
    onToggleTreatment: view.toggleChangeTreatment,
    onServiceSelect: view.selectRescheduleService,
    onToggleDoctor: view.toggleChangeDoctor,
    onDoctorSelect: view.setRescheduleDoctor ?? view.setRescheduleDoctorId,
    onMonthChange: view.setRescheduleMonth,
    onDateSelect: view.selectRescheduleDate,
    onStartTimeChange: view.setRescheduleTime ?? view.setRescheduleStartTime,
    onEndTimeChange: view.setRescheduleEndTime,
    onJustificationChange: view.setRescheduleJustification,
    onSubmit: view.submitReschedule,
    onBack: () => view.setShowRescheduleForm(false),
  };
}
