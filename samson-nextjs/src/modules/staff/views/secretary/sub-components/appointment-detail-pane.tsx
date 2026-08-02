'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, User, Bell, History } from 'lucide-react';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { SharedAppointmentDetail } from '@/modules/appointments/components/sub-components/shared-appointment-detail';
import { AppointmentCancelForm } from './appointment-cancel-form';
import { AppointmentRescheduleForm } from './appointment-reschedule-form';
import { AppointmentStatusHistory } from './appointment-status-history';
import { AppointmentNotificationsTab } from './appointment-notifications-tab';

interface AppointmentDetailPaneProps {
  view: any;
  compact?: boolean;
}

export function AppointmentDetailPane({ view, compact }: AppointmentDetailPaneProps) {
  const appointment = view.selectedAppointment as AppointmentDto | undefined;
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
  return <AppointmentDetails appointment={appointment} view={view} activeTab={view.activeTab} compact={compact} />;
}

function AppointmentDetails({ appointment, view, activeTab, compact }: { appointment: AppointmentDto; view: any; activeTab: AppointmentDirectoryTab; compact?: boolean }) {
  const [detailTab, setDetailTab] = useState<'overview' | 'notifications' | 'timeline'>('overview');

  const canModify = ['APPROVED', 'PENDING', 'RESCHEDULE_REQUESTED', 'DISPLACED'].includes(appointment.status);
  const canRescheduleOnly = appointment.status === 'NO_SHOW';

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
    return (
      <div className="flex flex-col flex-1 min-h-0 h-full">
        <div className="flex-1 min-h-0 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
          <AppointmentRescheduleForm appointment={appointment} {...getRescheduleProps(view)} noFooter />
        </div>
        <div className="shrink-0 border-t border-border px-4 py-3 bg-sidebar">
          <div className="flex gap-2">
            <Button onClick={view.submitReschedule} disabled={view.isSubmitting} className="flex-1 h-[42px] text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl disabled:opacity-50">
              {view.isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
            <Button variant="outline" onClick={() => view.setShowRescheduleForm(false)} className="flex-1 h-[42px] text-sm font-medium rounded-xl">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view.showCancelForm && (canModify || appointment.status === 'CHECKED_IN')) {
    const activeReason = view.cancelReasonPreset === 'CUSTOM' ? view.cancelReasonCustom : view.cancelReasonPreset;
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
        <div className="shrink-0 border-t border-border px-4 py-3 bg-sidebar">
          <div className="flex gap-2">
            <Button
              onClick={view.submitCancel}
              disabled={view.isSubmitting || !activeReason?.trim()}
              className="flex-1 h-[42px] text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 transition-colors rounded-xl disabled:opacity-50"
            >
              {view.isSubmitting ? 'Canceling...' : 'Confirm'}
            </Button>
            <Button
              variant="outline"
              onClick={() => view.setShowCancelForm(false)}
              className="flex-1 h-[42px] text-sm font-medium rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Sub-Header Tabs */}
      <div className="shrink-0 border-b border-card-border/40 px-5 bg-card/50">
        <div className="relative flex gap-6">
          {TABS.map((tab, idx) => {
            const isActive = detailTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(el) => { tabRefs[idx].current = el; }}
                onClick={() => setDetailTab(tab.key)}
                className={`py-3 text-sm font-semibold transition-colors ${
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
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        {detailTab === 'overview' && (
          <SharedAppointmentDetail
            appointment={appointment}
            compact={compact}
          />
        )}

        {detailTab === 'notifications' && (
          <AppointmentNotificationsTab
            appointment={appointment}
            view={view}
            compact={compact}
          />
        )}

        {detailTab === 'timeline' && (
          <AppointmentStatusHistory appointment={appointment} activeTab={activeTab} compact={compact} />
        )}
      </div>

      {/* Sticky Bottom Actions Bar */}
      {(() => {
        const canCancelOnly = appointment.status === 'CHECKED_IN';
        if (!canModify && !canRescheduleOnly && !canCancelOnly) return null;

        if (!view.showRescheduleForm && !view.showCancelForm) {
          return (
            <div className={`shrink-0 border-t border-border bg-sidebar ${compact ? 'p-3' : 'p-4'}`}>
              <div className="flex gap-2">
                {(canModify || canRescheduleOnly) && (
                  <Button variant="outline" className={`${canModify ? 'flex-1' : 'w-full'} h-[42px]`} onClick={() => view.setShowRescheduleForm(true)}>
                    Reschedule
                  </Button>
                )}
                {(canModify || canCancelOnly) && (
                  <Button variant="outline" className={`${canModify ? 'flex-1' : 'w-full'} h-[42px] border-destructive/50 text-destructive hover:bg-destructive/10`} onClick={() => view.setShowCancelForm(true)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className={`shrink-0 border-t border-border bg-sidebar ${compact ? 'p-3' : 'p-4'}`}>
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
              {view.showCancelForm && (canModify || canCancelOnly) && (
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
    endTime: view.rescheduleEndTime,
    confirmationChannel: view.confirmationChannel,
    onConfirmationChannelChange: view.setConfirmationChannel,
    justification: view.rescheduleJustification,
    isSubmitting: view.isSubmitting,
    onToggleTreatment: view.toggleChangeTreatment,
    onServiceSelect: view.selectRescheduleService,
    onToggleDoctor: view.toggleChangeDoctor,
    onDoctorSelect: view.setRescheduleDoctorId,
    onMonthChange: view.setRescheduleMonth,
    onDateSelect: view.selectRescheduleDate,
    onStartTimeChange: view.setRescheduleStartTime,
    onEndTimeChange: view.setRescheduleEndTime,
    onJustificationChange: view.setRescheduleJustification,
    onSubmit: view.submitReschedule,
    onBack: () => view.setShowRescheduleForm(false),
  };
}
