'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { PendingRequestOverview } from './pending-request-overview';
import { PendingDoctorSchedule } from './pending-doctor-schedule';
import { PendingEditPanel } from './pending-edit-panel';
import { PendingDecisionForm } from './pending-decision-form';
import { AppointmentNotificationsTab } from './appointment-notifications-tab';
import { AppointmentStatusHistory } from './appointment-status-history';

interface PendingRequestDetailPaneProps {
  view: any;
}

export function PendingRequestDetailPane({ view }: PendingRequestDetailPaneProps) {
  const [detailTab, setDetailTab] = useState<'overview' | 'notifications' | 'timeline'>('overview');

  const TABS = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'notifications' as const, label: 'Notifications' },
    { key: 'timeline' as const, label: 'Timeline' },
  ];

  const activeIndex = TABS.findIndex((t) => t.key === detailTab);
  const [tabOffsets, setTabOffsets] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const tabRef0 = useRef<HTMLButtonElement | null>(null);
  const tabRef1 = useRef<HTMLButtonElement | null>(null);
  const tabRef2 = useRef<HTMLButtonElement | null>(null);

  const tabRefs = useMemo(() => [tabRef0, tabRef1, tabRef2], []);

  useEffect(() => {
    const currentBtn = tabRefs[activeIndex]?.current;
    if (currentBtn) {
      setTabOffsets({
        left: currentBtn.offsetLeft,
        width: currentBtn.offsetWidth,
      });
    }
  }, [detailTab, activeIndex, tabRefs]);

  if (!view.selectedAppointment) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
        Select a pending appointment request from the table to start reviewing details.
      </div>
    );
  }

  if (view.isLoadingDetails) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-text-muted">
        Loading request details...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Sub-Header Tabs matching AppointmentDetailPane */}
      <div className="shrink-0 border-b border-card-border/40 -mx-6 -mt-6 px-6 mb-5 bg-card">
        <div className="relative flex gap-6">
          {TABS.map((tab, idx) => {
            const isActive = detailTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={tabRefs[idx]}
                onClick={() => setDetailTab(tab.key)}
                className={`py-2 text-xs xl:text-sm font-medium transition-colors ${
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

      {/* Tab Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
        {detailTab === 'overview' && (
          <div className="flex flex-col gap-5 h-full justify-between animate-in fade-in duration-200">
            <div className="flex flex-col gap-4">
              <PendingRequestOverview
                appointment={view.selectedAppointment}
                patientDetails={view.patientDetails}
                conflictingAppointment={view.conflictingAppointment}
              />
              <PendingDoctorSchedule appointment={view.selectedAppointment} doctorSchedule={view.doctorSchedule} />
            </div>
            <PendingEditPanel
              isEditing={view.isEditing}
              services={view.editServices}
              serviceId={view.editServiceId}
              doctors={view.editDoctors}
              doctorId={view.editDoctorId}
              availableDates={view.editAvailableDates}
              date={view.editDate}
              currentMonth={view.editCurrentMonth}
              startTime={view.editStartTime}
              endTime={view.editEndTime}
              note={view.editNote}
              isLoadingDays={view.isLoadingEditDays}
              onToggle={view.toggleEditing}
              onServiceChange={view.setEditService}
              onDoctorChange={view.setEditDoctor}
              onDateChange={view.setEditAppointmentDate}
              onMonthChange={view.setEditCurrentMonth}
              onStartTimeChange={view.setEditStartTime}
              onEndTimeChange={view.setEditEndTime}
              onNoteChange={view.setEditNote}
            />
            <PendingDecisionForm
              stagedStatus={view.stagedStatus}
              stagedReason={view.stagedReason}
              customReason={view.customReason}
              confirmationChannel={view.confirmationChannel}
              isSubmitting={view.isSubmitting}
              onDecisionChange={view.setDecision}
              onReasonChange={view.setReason}
              onCustomReasonChange={view.setCustomReason}
              onConfirmationChannelChange={view.setConfirmationChannel}
              onConfirm={() => view.finishAppointmentReview(view.selectedAppointment.id)}
            />
          </div>
        )}

        {detailTab === 'notifications' && (
          <div className="animate-in fade-in duration-200">
            <AppointmentNotificationsTab
              appointment={view.selectedAppointment}
              view={view}
              compact={false}
            />
          </div>
        )}

        {detailTab === 'timeline' && (
          <div className="animate-in fade-in duration-200">
            <AppointmentStatusHistory
              appointment={view.selectedAppointment}
              activeTab="pending"
              compact={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
