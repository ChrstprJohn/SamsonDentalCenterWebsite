'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, X, Check, Pencil, CalendarDays, RotateCw } from 'lucide-react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { SharedAppointmentDetail } from '@/modules/appointments/components/sub-components/shared-appointment-detail';
import { AppointmentCancelForm, isCancelFormComplete } from './appointment-cancel-form';
import { AppointmentRescheduleForm, isRescheduleFormComplete } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { AppointmentNotificationsTab } from './appointment-notifications-tab';
import { getTodayLocalDateStr, calculateEndTime } from '@/shared/utils/date.util';
import { Select } from '@/components/ui/select';
import { updateConfirmationChannelAction } from '@/modules/appointments/actions/status/update-confirmation-channel.action';

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
  onHeaderTitleChange?: (title: string | null) => void;
  onCustomBack?: (backFn: (() => boolean) | null) => void;
}

export function AppointmentDetailPane({
  view,
  compact,
  appointment: appointmentOverride,
  activeTab: activeTabOverride,
  hideActions,
  onAppointmentUpdated,
  onEditingGuestInfoChange,
  onHeaderTitleChange,
  onCustomBack,
}: AppointmentDetailPaneProps) {
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
  return (
    <AppointmentDetails
      appointment={appointment}
      view={view}
      activeTab={activeTabOverride || view.activeTab || 'upcoming'}
      compact={compact}
      hideActions={hideActions}
      onAppointmentUpdated={onAppointmentUpdated}
      onEditingGuestInfoChange={onEditingGuestInfoChange}
      onHeaderTitleChange={onHeaderTitleChange}
      onCustomBack={onCustomBack}
    />
  );
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

function AppointmentDetails({
  appointment,
  view,
  activeTab,
  compact,
  hideActions,
  onAppointmentUpdated,
  onEditingGuestInfoChange,
  onHeaderTitleChange,
  onCustomBack,
}: {
  appointment: AppointmentDto;
  view: any;
  activeTab: AppointmentDirectoryTab;
  compact?: boolean;
  hideActions?: boolean;
  onAppointmentUpdated?: () => void;
  onEditingGuestInfoChange?: (isEditing: boolean) => void;
  onHeaderTitleChange?: (title: string | null) => void;
  onCustomBack?: (backFn: (() => boolean) | null) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const prefix = pathname.startsWith('/secretary-v2') ? '/secretary-v2' : '/secretary';
  const [detailTab, setDetailTab] = useState<'overview' | 'notifications' | 'timeline'>('overview');
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [showResolvePane, setShowResolvePane] = useState(false);
  const prevIdRef = useRef(appointment.id);
  const prevTabRef = useRef(activeTab);
  const onHeaderTitleChangeRef = useRef(onHeaderTitleChange);
  onHeaderTitleChangeRef.current = onHeaderTitleChange;
  const onCustomBackRef = useRef(onCustomBack);
  onCustomBackRef.current = onCustomBack;

  // Reset resolve pane only when appointment or directory tab actually changes
  useEffect(() => {
    if (prevIdRef.current !== appointment.id || prevTabRef.current !== activeTab) {
      prevIdRef.current = appointment.id;
      prevTabRef.current = activeTab;
      setShowResolvePane(false);
      onHeaderTitleChangeRef.current?.(null);
      onCustomBackRef.current?.(null);
    }
  }, [appointment.id, activeTab]);

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
  const isCheckedIn = appointment.status === 'CHECKED_IN';
  // ponytail: same slot-past check as check-in board
  const slotEnd = getSlotEnd(appointment);
  const isPastEnd = !!slotEnd && new Date() > slotEnd;
  const canCancel = (canModify && !isPastEnd) || (isCheckedIn && appointment.date === todayStr);
  const isNoShowCandidate = appointment.status === 'NO_SHOW' || (appointment.status === 'APPROVED' && isPastEnd);
  const isResolvedNoShow = appointment.status === 'NO_SHOW' && !!appointment.noShowResolvedAt;
  // ponytail: past-day resolve lands on v2 directory (v1 lacks SidebarProvider and crashes), Unresolved tab preselected
  const resolveTarget = appointment.date === todayStr ? `${prefix}/check-in` : `${prefix}/appointments?tab=needs-attention&appointmentId=${appointment.id}`;

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

  // Unresolved tab: show inline resolve flow instead of standard tabs
  if (showResolvePane && activeTab === 'needs-attention') {
    return (
      <NeedsAttentionResolvePane
        appointment={appointment}
        view={view}
        compact={compact}
        onDone={() => {
          setShowResolvePane(false);
          onHeaderTitleChange?.(null);
          onCustomBack?.(null);
        }}
        onHeaderTitleChange={onHeaderTitleChange}
        onCustomBack={onCustomBack}
      />
    );
  }

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

  if (view.showCancelForm && canCancel) {
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
              const isActionBusy = Boolean(view.isSubmitting || view.isPending || view.isLoadingAppointmentDetails);

              if (activeTab === 'needs-attention') {
                // Show inline Resolve button for Unresolved tab
                if (isResolvedNoShow) {
                  return (
                    <div className="w-full flex items-center justify-center text-[11px] text-muted-foreground py-2">
                      No-show resolved — audit record in History
                    </div>
                  );
                }
                return (
                  <Button
                    className="w-full h-[42px] bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-semibold"
                    onClick={() => setShowResolvePane(true)}
                    disabled={isActionBusy}
                  >
                    {isActionBusy ? (
                      <span className="flex items-center gap-2">
                        <RotateCw className="size-4 animate-spin" />
                        <span>Updating...</span>
                      </span>
                    ) : (
                      'Resolve'
                    )}
                  </Button>
                );
              }
              if (activeTab === 'history') {
                const patientId = appointment.patientId || appointment.patient?.id || '';
                const serviceId = appointment.serviceId || '';
                const patientFirstName = appointment.dependent?.firstName || appointment.patient?.firstName || appointment.guestContact?.firstName || 'Patient';
                return (
                  <Button
                    variant="outline"
                    className="w-full h-[42px] gap-2 text-xs font-semibold rounded-xl hover:bg-muted/50 transition-colors border-primary/30 text-primary hover:text-primary"
                    disabled={isActionBusy}
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (patientId) params.set('patientId', patientId);
                      if (serviceId) params.set('serviceId', serviceId);
                      router.push(`${prefix}/book?${params.toString()}`);
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
                        <Button
                          className="flex-1 h-[42px] bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={isActionBusy}
                          onClick={() => router.push(resolveTarget)}
                        >
                          {resolveTarget.startsWith(`${prefix}/appointments`) ? 'Open Unresolved' : 'Open Check-In & Out'}
                        </Button>
                      )}
                      {isResolvedNoShow && (
                        <div className="w-full flex items-center justify-center text-[11px] text-muted-foreground py-2">
                          No-show resolved — audit record in History
                        </div>
                      )}
                      {canModify && !isPastEnd && (
                        <Button
                          variant="outline"
                          className="flex-1 h-[42px]"
                          disabled={isActionBusy}
                          onClick={() => view.setShowRescheduleForm(true)}
                        >
                          Reschedule
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          variant="outline"
                          className="flex-1 h-[42px] border-destructive/50 text-destructive hover:bg-destructive/10"
                          disabled={isActionBusy}
                          onClick={() => view.setShowCancelForm(true)}
                        >
                          Cancel
                        </Button>
                      )}
                      {isCheckedIn && !isPastEnd && (
                        <Button
                          className="flex-1 h-[42px] bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={isActionBusy}
                          onClick={() => router.push(`${prefix}/check-in`)}>
                          Open Check-In &amp; Out
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
                  {view.showCancelForm && canCancel && (
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
        if (activeTab === 'needs-attention') {
          if (isResolvedNoShow) {
            return (
              <div className={`shrink-0 border-t border-border ${compact ? 'p-3 bg-sidebar' : 'p-4 bg-card'}`}>
                <div className="w-full flex items-center justify-center text-[11px] text-muted-foreground py-2">
                  No-show resolved — audit record in History
                </div>
              </div>
            );
          }
          return (
            <div className={`shrink-0 border-t border-border ${compact ? 'p-3 bg-sidebar' : 'p-4 bg-card'}`}>
              <Button
                className="w-full h-[42px] bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-semibold"
                onClick={() => setShowResolvePane(true)}
              >
                Resolve
              </Button>
            </div>
          );
        }
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
                  router.push(`${prefix}/book?${params.toString()}`);
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
                    {resolveTarget.startsWith(`${prefix}/appointments`) ? 'Open Unresolved' : 'Open Check-In & Out'}
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
                {canCancel && (
                  <Button variant="outline" className="flex-1 h-[42px] border-destructive/50 text-destructive hover:bg-destructive/10" onClick={() => view.setShowCancelForm(true)}>
                    Cancel
                  </Button>
                )}
                {isCheckedIn && !isPastEnd && (
                  <Button className="flex-1 h-[42px] bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => router.push(`${prefix}/check-in`)}>
                    Open Check-In &amp; Out
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
              {view.showCancelForm && canCancel && (
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

// ---------------------------------------------------------------------------
// Inline resolve pane for the Unresolved (needs-attention) tab.
// Handles missed checkouts (past CHECKED_IN) and unresolved no-shows.
// ---------------------------------------------------------------------------
const RESOLVE_REASON_OPTIONS: Record<string, string[]> = {
  COMPLETED: ['Visit completed but status updated late', 'Patient was seen but not checked in', 'Status corrected after visit'],
  CONFIRMED_NO_SHOW: ['Patient failed to arrive for appointment', 'Patient arrived after closing', 'Patient refused treatment'],
  RESCHEDULE: ['Patient requested new date', 'Doctor requested reschedule', 'Administrative reschedule'],
};

function NeedsAttentionResolvePane({
  appointment,
  view,
  compact,
  onDone,
  onHeaderTitleChange,
  onCustomBack,
}: {
  appointment: AppointmentDto;
  view: any;
  compact?: boolean;
  onDone?: () => void;
  onHeaderTitleChange?: (title: string | null) => void;
  onCustomBack?: (backFn: (() => boolean) | null) => void;
}) {
  const isMissedCheckout = appointment.status === 'CHECKED_IN';
  const [resolveMode, setResolveMode] = useState<'COMPLETED' | 'CONFIRMED_NO_SHOW' | 'RESCHEDULE' | null>(null);
  const [resolveReason, setResolveReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [isEditingRescheduleChannel, setIsEditingRescheduleChannel] = useState(false);

  const onHeaderTitleChangeRef = useRef(onHeaderTitleChange);
  onHeaderTitleChangeRef.current = onHeaderTitleChange;
  const onCustomBackRef = useRef(onCustomBack);
  onCustomBackRef.current = onCustomBack;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Sync header title with active resolve mode / form
  useEffect(() => {
    let title = isMissedCheckout ? 'Resolve Missed Checkout' : 'Resolve No-Show';
    if (showRescheduleForm) {
      title = 'Reschedule Appointment';
    } else if (resolveMode === 'COMPLETED') {
      title = isMissedCheckout ? 'Checkout Missed Visit' : 'Checkout Patient';
    } else if (resolveMode === 'CONFIRMED_NO_SHOW') {
      title = 'Keep Confirmed No-Show';
    }
    onHeaderTitleChangeRef.current?.(title);
  }, [showRescheduleForm, resolveMode, isMissedCheckout]);

  // Handle header ArrowLeft button click to step back within resolve flow
  useEffect(() => {
    const handleBack = () => {
      if (showRescheduleForm) {
        setShowRescheduleForm(false);
        return true;
      }
      if (resolveMode) {
        setResolveMode(null);
        return true;
      }
      onDoneRef.current?.();
      return true;
    };
    onCustomBackRef.current?.(handleBack);
    return () => {
      onCustomBackRef.current?.(null);
    };
  }, [showRescheduleForm, resolveMode]);

  const initialChannel = (appointment.confirmationChannel || 'EMAIL') as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
  const [channel, setChannel] = useState(initialChannel);
  const [draftChannel, setDraftChannel] = useState(initialChannel);
  const [isEditingChannel, setIsEditingChannel] = useState(false);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  const handleSaveChannel = async () => {
    setIsSavingChannel(true);
    const res = await updateConfirmationChannelAction({
      appointmentId: appointment.id,
      confirmationChannel: draftChannel,
    });
    if (res.success) {
      setChannel(draftChannel);
      appointment.confirmationChannel = draftChannel;
      setIsEditingChannel(false);
      if (view?.fetchData) view.fetchData();
    }
    setIsSavingChannel(false);
  };

  const reset = () => {
    setResolveMode(null);
    setResolveReason('');
    setSelectedPreset('');
    setShowCustomReason(false);
    setShowRescheduleForm(false);
  };

  const isBusy = Boolean(view.isSubmitting || view.isPending);

  const handleResolveSubmit = async () => {
    if (draftChannel !== channel) await handleSaveChannel();
    let ok = false;
    if (isMissedCheckout) {
      ok = await view.completeMissedCheckout?.(appointment.id, resolveReason.trim() || 'Late checkout — past appointment follow-up');
    } else {
      if (!resolveMode || !resolveReason.trim()) return;
      ok = await view.handleResolveNoShowSubmit?.({
        appointmentId: appointment.id,
        resolution: resolveMode,
        reason: resolveReason.trim(),
        confirmationChannel: channel,
      });
    }
    if (ok !== false) {
      reset();
      onDone?.();
    }
  };

  const handleRescheduleSubmit = async () => {
    const fmt = (ds: string, ts: string) => `${ds}T${ts.length === 5 ? ts + ':00' : ts}Z`;
    const duration = appointment.service?.durationMinutes || 30;
    let computedEndTime = view.rescheduleEndTime;
    if (!computedEndTime || (view.rescheduleTime && computedEndTime <= view.rescheduleTime)) {
      computedEndTime = calculateEndTime(view.rescheduleTime, duration);
    }
    const ok = await view.handleResolveNoShowSubmit?.({
      appointmentId: appointment.id,
      resolution: 'RESCHEDULE',
      reason: view.rescheduleJustification || 'Rescheduled from past no-show follow-up',
      newDate: view.rescheduleDate || appointment.date,
      newStartTime: view.rescheduleTime ? fmt(view.rescheduleDate || appointment.date, view.rescheduleTime) : undefined,
      newEndTime: computedEndTime ? fmt(view.rescheduleDate || appointment.date, computedEndTime) : undefined,
      newDoctorId: view.rescheduleDoctor || appointment.doctorId || undefined,
      confirmationChannel: channel,
    });
    if (ok !== false) {
      reset();
      onDone?.();
    }
  };

  const bg = compact ? 'bg-sidebar' : 'bg-card';

  // --- Reschedule form ---
  if (showRescheduleForm) {
    const isFormComplete = isRescheduleFormComplete({
      serviceId: appointment.serviceId,
      doctorId: view.rescheduleDoctor || appointment.doctorId || '',
      date: view.rescheduleDate || appointment.date,
      startTime: view.rescheduleTime || '',
      endTime: view.rescheduleEndTime || '',
      justification: view.rescheduleJustification || '',
    });
    return (
      <div className={`flex flex-col flex-1 min-h-0 h-full`}>
        <div className="flex-1 min-h-0 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
          <AppointmentRescheduleForm
            appointment={appointment}
            services={view.servicesList || []}
            serviceId={appointment.serviceId}
            doctorId={view.rescheduleDoctor || appointment.doctorId || ''}
            doctors={(view.doctorsList || []).map((d: any) => ({ doctorId: d.id, doctorName: `Dr. ${d.firstName} ${d.lastName}` }))}
            date={view.rescheduleDate || appointment.date}
            activeServiceId={appointment.serviceId}
            activeDoctorId={appointment.doctorId || ''}
            startTime={view.rescheduleTime || ''}
            endTime={view.rescheduleEndTime || ''}
            justification={view.rescheduleJustification || ''}
            confirmationChannel={channel}
            onConfirmationChannelChange={(ch) => { setChannel(ch as any); setDraftChannel(ch as any); }}
            onEditingChannelChange={setIsEditingRescheduleChannel}
            isSubmitting={isBusy}
            noFooter
            onServiceSelect={() => {}}
            onDoctorSelect={(docId: string) => view.setRescheduleDoctor?.(docId)}
            onDateSelect={(d: string) => view.setRescheduleDate?.(d)}
            onStartTimeChange={(t: string) => view.setRescheduleTime?.(t)}
            onEndTimeChange={(t: string) => view.setRescheduleEndTime?.(t)}
            onJustificationChange={(j: string) => view.setRescheduleJustification?.(j)}
            onSubmit={handleRescheduleSubmit}
            onBack={() => setShowRescheduleForm(false)}
          />
        </div>
        <div className={`shrink-0 border-t border-border px-4 py-3 ${bg}`}>
          <div className="flex flex-col gap-2">
            {isEditingRescheduleChannel && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
                Please finish editing or save notification channel before confirming.
              </p>
            )}
            <div className={`flex gap-2 ${isEditingRescheduleChannel ? 'pointer-events-none opacity-40' : ''}`}>
              <Button
                onClick={handleRescheduleSubmit}
                disabled={isBusy || !isFormComplete || isEditingRescheduleChannel}
                className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40"
              >
                {isBusy ? (
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  'Confirm'
                )}
              </Button>
              <Button
                variant="outline"
                disabled={isBusy}
                onClick={() => setShowRescheduleForm(false)}
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

  // --- Resolution mode picker or reason entry ---
  if (!resolveMode) {
    // Show action picker
    return (
      <div className={`flex flex-col flex-1 min-h-0 h-full`}>
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
          <div className="px-4 py-4 space-y-4">
            <div className="flex flex-col gap-3">
              {!isMissedCheckout && (
                <button
                  type="button"
                  onClick={() => { setResolveMode('CONFIRMED_NO_SHOW'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                  className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 text-left flex items-start gap-3.5 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="size-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-105 transition-transform">
                    <X className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">Keep No-Show</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">Confirm patient failed to show up. Logs appointment as no-show.</span>
                  </div>
                </button>
              )}
              <button
                type="button"
                onClick={() => { setResolveMode('COMPLETED'); setSelectedPreset(''); setResolveReason(''); setShowCustomReason(false); }}
                className="w-full p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-left flex items-start gap-3.5 transition-all cursor-pointer group shadow-sm"
              >
                <div className="size-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Check className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Checkout (Mark Completed)</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">Mark visit as completed and dispatch post-care notification.</span>
                </div>
              </button>
              {!isMissedCheckout && (
                <button
                  type="button"
                  onClick={() => {
                    const toHHMM = (t?: string) => { if (!t) return ''; if (t.includes('T')) { const p = t.split('T')[1]; if (p) return p.slice(0, 5); } const m = t.match(/^(\d{2}):(\d{2})/); return m ? `${m[1]}:${m[2]}` : ''; };
                    view.setRescheduleDoctor?.(appointment.doctorId || '');
                    view.setRescheduleDate?.(appointment.date || '');
                    view.setRescheduleTime?.(toHHMM(appointment.startTime ?? undefined));
                    view.setRescheduleEndTime?.(toHHMM(appointment.endTime ?? undefined));
                    view.setRescheduleJustification?.('');
                    void view.loadActionResources?.();
                    setShowRescheduleForm(true);
                  }}
                  className="w-full p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/40 text-left flex items-start gap-3.5 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="size-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Pencil className="size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">Reschedule</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">Pick a new date, slot, doctor, or treatment service.</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className={`shrink-0 border-t border-border px-4 py-3 ${bg}`}>
          <Button variant="outline" onClick={onDone} className="w-full h-[42px] text-sm font-medium rounded-xl">
            Back
          </Button>
        </div>
      </div>
    );
  }

  // --- Reason entry for COMPLETED or CONFIRMED_NO_SHOW ---
  const isReady = isMissedCheckout ? true : !!resolveReason.trim();
  return (
    <div className={`flex flex-col flex-1 min-h-0 h-full`}>
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        <div className="px-4 py-4 space-y-4">
          {resolveMode === 'COMPLETED' && (
            <div className="p-3 border bg-amber-500/5 border-amber-500/20 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Completion Notice</span>
              <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">This will complete the visit and send the selected post-care message.</div>
            </div>
          )}
          {resolveMode === 'CONFIRMED_NO_SHOW' && (
            <div className="p-3 border bg-red-500/5 border-red-500/20 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">No-Show Notice</span>
              <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Clicking Confirm will keep this appointment marked as <strong>Confirmed No-Show</strong> in system audit logs and send the missed-appointment notification via the selected channel.</div>
            </div>
          )}
          {/* Notification channel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Notification Channel</span>
              {!isEditingChannel ? (
                <button onClick={() => setIsEditingChannel(true)} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"><Pencil className="size-3.5" /> Edit</button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setDraftChannel(channel); setIsEditingChannel(false); }} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground hover:bg-accent"><X className="size-3.5" /> Cancel</button>
                  <button onClick={handleSaveChannel} disabled={isSavingChannel || draftChannel === channel} className="h-7 px-2.5 text-xs gap-1 inline-flex items-center justify-center rounded-md bg-slate-900 text-white disabled:opacity-40"><Check className="size-3.5" /> {isSavingChannel ? 'Saving...' : 'Save'}</button>
                </div>
              )}
            </div>
            {isEditingChannel ? (
              <Select value={draftChannel} onChange={(e) => setDraftChannel(e.target.value as any)} className="text-sm w-full" options={[{ value: 'EMAIL', label: 'Email' }, { value: 'SMS', label: 'SMS' }, { value: 'BOTH', label: 'Email & SMS' }, { value: 'NONE', label: 'None' }]} />
            ) : (
              <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{channel === 'EMAIL' ? 'Email' : channel === 'SMS' ? 'SMS' : channel === 'BOTH' ? 'Email & SMS' : 'None'}</div>
            )}
          </div>
          {/* Reason */}
          {!isMissedCheckout && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Reason for Resolution <span className="text-destructive">*</span></span>
              <select
                value={selectedPreset}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__custom__') { setShowCustomReason(true); setResolveReason(''); }
                  else { setShowCustomReason(false); setSelectedPreset(v); setResolveReason(v); }
                }}
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              >
                <option value="" disabled>Select reason...</option>
                {RESOLVE_REASON_OPTIONS[resolveMode]?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                <option value="__custom__">Custom</option>
              </select>
              {showCustomReason && (
                <textarea value={resolveReason} onChange={(e) => setResolveReason(e.target.value)} rows={2} placeholder="Type custom reason..." className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none" />
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`shrink-0 border-t border-border px-4 py-3 ${bg}`}>
        <div className="flex flex-col gap-2">
          {isEditingChannel && (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
              Please finish editing or save channel changes before confirming.
            </p>
          )}
          <div className={`flex gap-2 ${isEditingChannel ? 'pointer-events-none opacity-40' : ''}`}>
            <Button
              onClick={handleResolveSubmit}
              disabled={isBusy || isEditingChannel || !isReady}
              className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-40"
            >
              {isBusy ? (
                <span className="flex items-center gap-1.5">
                  <RotateCw className="size-3.5 animate-spin" />
                  <span>Submitting...</span>
                </span>
              ) : (
                'Confirm'
              )}
            </Button>
            <Button
              variant="outline"
              disabled={isBusy}
              onClick={() => setResolveMode(null)}
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
