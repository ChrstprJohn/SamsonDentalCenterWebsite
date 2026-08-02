'use client';

import { useMemo, useState } from 'react';
import { useSecretaryAppointments } from '../../hooks/secretary/use-secretary-appointments';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { AppointmentsTable } from './sub-components/appointments-table';
import { CoordinationHub } from './sub-components/coordination-hub';
import { ArrowLeft, CalendarDays, ClipboardList } from 'lucide-react';
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

  const upcomingCount = useMemo(() =>
    view.appointments.filter((a) => ['APPROVED', 'CHECKED_IN'].includes(a.status)).length,
    [view.appointments]
  );
  const historyCount = useMemo(() =>
    view.appointments.filter((a) => ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED', 'NO_SHOW'].includes(a.status)).length,
    [view.appointments]
  );

  const TABS = [
    { key: 'upcoming' as const, label: 'Active', count: upcomingCount },
    { key: 'history' as const, label: 'History', count: historyCount },
  ];

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      {/* Column 1: Appointments List */}
      <div className={`xl:w-[350px] lg:w-[320px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar min-h-0 overflow-hidden ${colMobile('list')} lg:flex`}>
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
          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
            {TABS.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => view.selectTab(tab.key)}
                variant="ghost"
                size="sm"
                className={`flex-1 h-8 text-xs font-semibold rounded-xl transition-all ${
                  view.activeTab === tab.key
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>
        </SidebarHeader>
        <AppointmentsTable
          appointments={view.filteredAppointments}
          selectedAppointmentId={view.selectedAppointmentId}
          isLoading={view.isLoading}
          formatPatientName={view.formatPatientName}
          onSelect={(id) => { view.setSelectedAppointmentId(id); setMobileView('detail'); }}
        />
      </div>

      {/* Column 2: Appointment Details */}
      {hasSelection ? (
        <div className={`flex flex-1 flex-col min-w-0 min-h-0 h-full ${colMobile('detail')} lg:flex`}>
          <div className="p-4 border-b border-card-border/40 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
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
              <div className="text-base font-medium text-foreground text-left">
                {view.showRescheduleForm ? 'Reschedule' : view.showCancelForm ? 'Cancel Appointment' : 'Appointment Details'}
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

