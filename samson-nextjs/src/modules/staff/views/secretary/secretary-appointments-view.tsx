'use client';

import { useMemo, useState } from 'react';
import { useSecretaryAppointments } from '../../hooks/secretary/use-secretary-appointments';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { AppointmentsTable } from './sub-components/appointments-table';
import { ArrowLeft, CalendarClock, CalendarDays, History } from 'lucide-react';
import { SidebarHeader, SidebarInput, SidebarTrigger } from '@/components/ui/sidebar';

export function SecretaryAppointmentsView() {
  const view = useSecretaryAppointments();
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [search, setSearch] = useState('');

  const colMobile = (v: 'list' | 'detail') =>
    mobileView === v ? 'flex' : 'hidden';

  const hasSelection = !!view.selectedAppointment;

  const handleSearch = (val: string) => {
    setSearch(val);
    view.setSearchTerm(val);
  };

  const upcomingCount = useMemo(() =>
    view.appointments.filter((a) => a.status === 'APPROVED').length,
    [view.appointments]
  );
  const historyCount = useMemo(() =>
    view.appointments.filter((a) => ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED', 'NO_SHOW'].includes(a.status)).length,
    [view.appointments]
  );

  const TABS = [
    { key: 'upcoming' as const, label: 'Upcoming', icon: CalendarClock, count: upcomingCount },
    { key: 'history' as const, label: 'History', icon: History, count: historyCount },
  ];

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      <div className={`lg:w-[350px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar min-h-0 overflow-hidden ${colMobile('list')} lg:flex`}>
        <SidebarHeader className="gap-3.5 border-b border-card-border/40 p-4 shrink-0">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-base font-medium text-foreground">
              <div className="lg:hidden">
                <SidebarTrigger />
              </div>
              <span>Appointments Directory</span>
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
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => view.selectTab(tab.key)}
                  className={`flex-1 h-8 text-xs rounded-xl font-semibold transition-all duration-300 outline-none select-none active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                    view.activeTab === tab.key
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-3.5" />
                  {tab.label} ({tab.count})
                </button>
              );
            })}
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

      {hasSelection ? (
        <div className={`flex flex-1 flex-col min-w-0 min-h-0 h-full ${colMobile('detail')} lg:flex`}>
          <div className="p-4 border-b border-card-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileView('list')} className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex-1 flex flex-col text-left min-w-0">
                <span className="text-base font-medium text-foreground truncate">
                  Appointment Details
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {view.selectedAppointment?.id ? `Ref #${view.selectedAppointment.id.slice(0, 8)}` : ''}
                </span>
              </div>
            </div>
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
    </div>
  );
}
