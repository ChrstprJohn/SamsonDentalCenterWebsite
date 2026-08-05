'use client';

import { useState } from 'react';
import { useSecretaryAppointments } from '../../hooks/secretary/use-secretary-appointments';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { AppointmentsTable } from './sub-components/appointments-table';
import { CoordinationHub } from './sub-components/coordination-hub';
import { ArrowLeft, CalendarDays, ClipboardList, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarHeader, SidebarInput, SidebarTrigger } from '@/components/ui/sidebar';

export function SecretaryAppointmentsView() {
  const view = useSecretaryAppointments();
  const [mobileView, setMobileView] = useState<'list' | 'detail' | 'quickLogs'>('list');
  const [search, setSearch] = useState('');

  const colMobile = (v: 'list' | 'detail' | 'quickLogs') =>
    mobileView === v ? 'flex' : 'hidden';

  const hasSelection = !!view.selectedAppointment;

  const handleSearch = (val: string) => {
    setSearch(val);
    view.setSearchTerm(val);
  };

  const TABS = [
    { key: 'upcoming' as const, label: 'Active', count: view.tabTotals.upcoming },
    { key: 'history' as const, label: 'History', count: view.tabTotals.history },
  ];

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      {/* Column 1: Appointments List */}
      <div className={`xl:w-[400px] lg:w-[380px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar min-h-0 overflow-hidden ${colMobile('list')} lg:flex`}>
        <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
          <div className="flex w-full h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
              <div className="text-base font-medium text-foreground">
                Appointments Directory
              </div>
            </div>
          </div>
          <div className="px-1">
            <SidebarInput
              placeholder="Type to search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-md"
            />
          </div>
        {(() => {
          const activeIndex = TABS.findIndex((t) => t.key === view.activeTab);
          const safeIndex = activeIndex < 0 ? 0 : activeIndex;
          return (
            <div className="relative grid grid-cols-2 gap-1 bg-muted/20 p-1 rounded-xl">
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-primary transition-transform duration-200 ease-out shadow-xs"
                style={{
                  width: 'calc((100% - 0.25rem) / 2)',
                  transform: `translateX(calc(${safeIndex} * (100% + 0.25rem)))`,
                }}
              />
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => view.selectTab(tab.key)}
                  className={`relative z-10 h-8 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center ${
                    view.activeTab === tab.key
                      ? 'text-primary-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          );
        })()}
        </SidebarHeader>
        {view.lastRefreshedAt ? (
          <div className="px-4 py-2 text-[10px] text-muted-foreground border-b border-card-border/20 flex items-center justify-between shrink-0">
            <span>Last updated {view.lastRefreshedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void view.fetchData({ force: true })}
              disabled={view.isLoading || view.isRefreshing}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Refresh appointments"
              title="Refresh"
            >
              <RotateCw className={`size-3 ${view.isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        ) : null}
        <AppointmentsTable
          appointments={view.visibleAppointments}
          selectedAppointmentId={view.selectedAppointmentId}
          isLoading={view.isLoading}
          isRefreshing={view.isRefreshing}
          error={view.error}
          hasMore={view.hasMore}
          isLoadingMore={view.isLoadingMore}
          loadMoreError={view.loadMoreError}
          onRetry={() => void view.fetchData({ force: true })}
          onLoadMore={view.loadMore}
          formatPatientName={view.formatPatientName}
            onSelect={(id) => { view.selectAppointment(id); setMobileView('detail'); }}
        />
      </div>

      {/* Column 2: Appointment Details */}
      {hasSelection ? (
        <div className={`flex flex-1 flex-col min-w-0 min-h-0 h-full ${colMobile('detail')} lg:flex`}>
          <div className="p-4 border-b border-card-border/40 shrink-0 flex items-center justify-between h-14">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => {
                  if (view.showRescheduleForm) {
                    view.setShowRescheduleForm(false);
                  } else if (view.showCancelForm) {
                    view.setShowCancelForm(false);
                  } else {
                    view.setSelectedAppointmentId(null);
                    setMobileView('list');
                  }
                }}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="text-base font-medium text-foreground text-left truncate">
                {view.showRescheduleForm ? 'Reschedule Appointment' : view.showCancelForm ? 'Cancel Appointment' : 'Appointment Details'}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileView('quickLogs')}
              className="xl:hidden gap-1.5 text-xs h-8"
            >
              <ClipboardList className="size-3.5" />
              <span>Notes & Logs</span>
            </Button>
          </div>
          <AppointmentDetailPane view={view} />
        </div>
      ) : (
        <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 max-lg:hidden flex p-6 text-center">
          <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
            <CalendarDays className="size-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No Appointment Selected</p>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">Select an appointment from the list to view patient details and status.</p>
        </div>
      )}

      {/* Column 3: Staff Notes & Logs */}
      {hasSelection && (
        <div className={`xl:w-[350px] lg:w-[320px] flex-col border-l border-card-border/40 min-h-0 overflow-hidden ${colMobile('quickLogs')} xl:flex`}>
          <CoordinationHub
            inquiryId={view.selectedAppointmentId}
            onBack={() => setMobileView('detail')}
          />
        </div>
      )}
    </div>
  );
}
