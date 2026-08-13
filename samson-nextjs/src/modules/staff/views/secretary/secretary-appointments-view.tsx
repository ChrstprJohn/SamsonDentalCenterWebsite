'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSecretaryAppointments } from '../../hooks/secretary/use-secretary-appointments';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { AppointmentsTable } from './sub-components/appointments-table';
import { CoordinationHub } from './sub-components/coordination-hub';
import { ArrowLeft, CalendarDays, CheckCircle2, AlertCircle, Clock, ClipboardList, RotateCw, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SidebarHeader, SidebarInput, SidebarTrigger } from '@/components/ui/sidebar';

// Directory tab for an appointment status — matches hook statusesForTab.
export function SecretaryAppointmentsView() {
  const view = useSecretaryAppointments();
  const [mobileView, setMobileView] = useState<'list' | 'detail' | 'quickLogs'>('list');
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [detailHeaderTitle, setDetailHeaderTitle] = useState<string | null>(null);
  const customBackRef = useRef<(() => boolean) | null>(null);
  const handleCustomBack = useCallback((fn: (() => boolean) | null) => {
    customBackRef.current = fn;
  }, []);
  const [isDeepLinking, setIsDeepLinking] = useState(false);
  const [isDeepLinkDetailReady, setIsDeepLinkDetailReady] = useState(false);
  const [search, setSearch] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftDoctor, setDraftDoctor] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draftSource, setDraftSource] = useState('');
  const filterBoxRef = useRef<HTMLDivElement>(null);

  // Deep link: /secretary-v2/appointments?appointmentId=... auto-opens that appointment on its tab
  // (delivery log + notification links; `id` accepted for legacy cancel links). Also applies optional
  // ?status=CANCELLED (History tab) and ?date=/?doctorId= list filters. Resolve the linked
  // appointment's tab first, then load that tab's list before opening the detail pane.
  // This prevents the default Active list from racing it.
  const deepLinkHandledRef = useRef(false);
  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('appointmentId') ?? params.get('id');
    const status = params.get('status');
    const date = params.get('date');
    const doctorId = params.get('doctorId');
    if (!id && !status && !date && !doctorId) return;
    deepLinkHandledRef.current = true;
    if (date) view.setDateFilter(date);
    if (doctorId) view.setDoctorFilter(doctorId);
    if (status === 'CANCELLED') view.selectTab('history');
    if (!id) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    setIsDeepLinking(true);
    window.history.replaceState({}, '', window.location.pathname);
    void getStaffAppointmentByIdAction(id).then((result) => {
      if (!result.success || !result.data) {
        setIsDeepLinking(false);
        return;
      }
      // Land on the tab this appointment belongs to, not whatever tab is active —
      // deep links come from the delivery log / notifications 3-dot menus.
      const tab =
        result.data.status === 'COMPLETED' || result.data.status === 'CANCELLED' ||
        result.data.status === 'REJECTED' || result.data.status === 'DISPLACED'
          ? 'history'
          : result.data.status === 'NO_SHOW' && !result.data.noShowResolvedAt
            ? 'needs-attention'
            : 'upcoming';
      view.selectTab(tab);
      view.preserveSelection();
      view.selectAppointment(id, result.data);
      setIsDeepLinkDetailReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the directory in its loading state until the selected appointment's full
  // detail record has arrived, not merely until the correct list page is available.
  useEffect(() => {
    if (isDeepLinking && !view.isLoading && isDeepLinkDetailReady) {
      setIsDeepLinking(false);
    }
  }, [isDeepLinking, view.isLoading, isDeepLinkDetailReady]);

  useEffect(() => {
    if (!showFilters) return;
    const onPointerDown = (e: MouseEvent) => {
      if (filterBoxRef.current && !filterBoxRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [showFilters]);

  const colMobile = (v: 'list' | 'detail' | 'quickLogs') =>
    mobileView === v ? 'flex' : 'hidden';

  const hasSelection = !!view.selectedAppointment;

  const handleSearch = (val: string) => {
    setSearch(val);
    view.setSearchTerm(val);
  };

  const TABS = [
    { key: 'upcoming' as const, label: 'Active', count: view.tabTotals.upcoming },
    { key: 'needs-attention' as const, label: 'Unresolved', count: view.tabTotals['needs-attention'] },
    { key: 'history' as const, label: 'History', count: view.tabTotals.history },
  ];

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden">
      {/* Column 1: Appointments List */}
      <div className={`xl:w-[400px] lg:w-[380px] flex-1 lg:flex-none flex-col border-r border-card-border/40 bg-sidebar min-h-0 overflow-hidden ${colMobile('list')} lg:flex`}>
        <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
          <div ref={filterBoxRef} className="relative flex w-full h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
              <span className="text-base font-medium text-foreground">
                Appointments Directory
              </span>
            </div>
            <button
              onClick={() => {
                if (!showFilters) {
                  setDraftDate(view.dateFilter);
                  setDraftDoctor(view.doctorFilter);
                  setDraftStatus(view.historyStatusFilter);
                  setDraftSource(view.sourceFilter);
                }
                setShowFilters((v) => !v);
              }}
              className={`flex items-center gap-1 rounded-md p-1.5 text-xs transition-colors ${
                showFilters || view.dateFilter || view.doctorFilter || view.historyStatusFilter || view.sourceFilter
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
              aria-label="Toggle filters"
              title="Filters"
            >
              <SlidersHorizontal className="size-4" />
              <span>Filters</span>
            </button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl bg-popover p-3 shadow-lg ring-1 ring-foreground/10 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">By Appointment Date</span>
                  <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="h-8 w-full rounded-md border border-card-border/60 bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label="Filter by date"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">By Doctor</span>
                  <Select
                    value={draftDoctor}
                    onChange={(e) => setDraftDoctor(e.target.value)}
                    className="h-8 w-full rounded-md border border-card-border/60 bg-transparent px-2! pr-8! py-0! text-xs"
                    options={[
                      { value: '', label: 'All doctors' },
                      ...view.doctors.map((doctor) => ({ value: doctor.id, label: `Dr. ${doctor.firstName} ${doctor.lastName}` })),
                    ]}
                    aria-label="Filter by doctor"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">By Source</span>
                  <Select
                    value={draftSource}
                    onChange={(e) => setDraftSource(e.target.value)}
                    className="h-8 w-full rounded-md border border-card-border/60 bg-transparent px-2! pr-8! py-0! text-xs"
                    options={[
                      { value: '', label: 'All sources' },
                      { value: 'STAFF_CREATED', label: 'From Manual Booking' },
                      { value: 'CONVERTED', label: 'From Online Request' },
                    ]}
                    aria-label="Filter by source"
                  />
                </label>
                {view.activeTab === 'history' && (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-muted-foreground">By Status</span>
                    <Select
                      value={draftStatus}
                      onChange={(e) => setDraftStatus(e.target.value)}
                      className="h-8 w-full rounded-md border border-card-border/60 bg-transparent px-2! pr-8! py-0! text-xs"
                      options={[
                        { value: '', label: 'All statuses' },
                        { value: 'COMPLETED', label: 'Completed' },
                        { value: 'CANCELLED', label: 'Cancelled' },
                        { value: 'REJECTED', label: 'Rejected' },
                        { value: 'DISPLACED', label: 'Displaced' },
                        { value: 'NO_SHOW', label: 'No Show' },
                      ]}
                      aria-label="Filter by status"
                    />
                  </label>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraftDate('');
                      setDraftDoctor('');
                      setDraftStatus('');
                      setDraftSource('');
                      view.setDateFilter('');
                      view.setDoctorFilter('');
                      view.setHistoryStatusFilter('');
                      view.setSourceFilter('');
                      setShowFilters(false);
                    }}
                    className="flex-1 h-8 text-xs"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      view.setDateFilter(draftDate);
                      view.setDoctorFilter(draftDoctor);
                      view.setHistoryStatusFilter(draftStatus);
                      view.setSourceFilter(draftSource);
                      setShowFilters(false);
                    }}
                    className="flex-1 h-8 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background"
                  >
                    Save Filters
                  </Button>
                </div>
              </div>
            )}
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
            <div className="relative grid grid-cols-3 gap-1 bg-muted/20 p-1 rounded-xl">
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-primary transition-transform duration-200 ease-out shadow-xs"
                style={{
                  width: 'calc((100% - 0.5rem) / 3)',
                  transform: `translateX(calc(${safeIndex} * (100% + 0.25rem)))`,
                }}
              />
              {TABS.map((tab) => {
                const isSelected = view.activeTab === tab.key;
                const isActionTab = tab.key === 'needs-attention';
                const showBadge = isActionTab && tab.count > 0;

                return (
                  <button
                    key={tab.key}
                    onClick={() => view.selectTab(tab.key)}
                    className={`relative z-10 h-8 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {showBadge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
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
          total={view.tabTotals[view.activeTab] ?? view.visibleAppointments.length}
          selectedAppointmentId={view.selectedAppointmentId}
          isLoading={view.isLoading}
          isRefreshing={view.isRefreshing}
          error={view.error}
          hasMore={view.hasMore}
          isLoadingMore={view.isLoadingMore}
          loadMoreError={view.loadMoreError}
          canGoNewer={view.canGoNewer}
          onRetry={() => void view.fetchData({ force: true })}
          onLoadMore={view.loadMore}
          onGoNewer={view.goNewer}
          formatPatientName={view.formatPatientName}
            onSelect={(id) => { view.selectAppointment(id); setMobileView('detail'); }}
            activeTab={view.activeTab}
            pinnedAppointment={
              view.selectedAppointment &&
              (view.activeTab === 'needs-attention'
                ? (view.selectedAppointment.status === 'NO_SHOW' && !view.selectedAppointment.noShowResolvedAt) ||
                  (view.selectedAppointment.status === 'CHECKED_IN' && (!view.selectedAppointment.date || view.selectedAppointment.date < new Date().toISOString().slice(0, 10)))
                : view.activeTab === 'upcoming'
                  ? view.selectedAppointment.status === 'APPROVED' || view.selectedAppointment.status === 'CHECKED_IN' || (view.selectedAppointment.status === 'NO_SHOW' && !view.selectedAppointment.noShowResolvedAt)
                  : ['COMPLETED', 'CANCELLED', 'REJECTED', 'DISPLACED'].includes(view.selectedAppointment.status) || (view.selectedAppointment.status === 'NO_SHOW' && Boolean(view.selectedAppointment.noShowResolvedAt)))
                ? view.selectedAppointment
                : null
            }
        />
      </div>

      {/* Column 2: Appointment Details */}
      {!isDeepLinking && hasSelection ? (
        <div className={`flex flex-1 flex-col min-w-0 min-h-0 h-full ${colMobile('detail')} lg:flex`}>
          <div className="p-4 border-b border-card-border/40 shrink-0 flex items-center justify-between h-14">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => {
                  if (customBackRef.current && customBackRef.current()) {
                    return;
                  }
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
                {detailHeaderTitle || (view.showRescheduleForm ? 'Reschedule Appointment' : view.showCancelForm ? 'Cancel Appointment' : 'Appointment Details')}
              </div>
            </div>
            {/* Top Right Toggle Button for Staff Notes (Visible when panel is closed) */}
            {!showNotesPanel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNotesPanel(true);
                  setMobileView('quickLogs');
                }}
                className="gap-1.5 text-xs h-8"
                title="Open Staff Notes & Logs"
              >
                <ClipboardList className="size-3.5" />
                <span>Notes & Logs</span>
              </Button>
            )}
          </div>
          <AppointmentDetailPane
            view={view}
            activeTab={view.activeTab}
            onAppointmentUpdated={view.onAppointmentUpdated}
            onHeaderTitleChange={setDetailHeaderTitle}
            onCustomBack={handleCustomBack}
          />
        </div>
      ) : isDeepLinking || view.isLoading ? (
        <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 max-lg:hidden flex p-6 text-center">
          <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
            <RotateCw className="size-6 text-muted-foreground/50 animate-spin" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isDeepLinking ? 'Loading appointment...' : 'Loading appointments...'}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            {isDeepLinking ? 'Fetching the linked appointment.' : 'Fetching the appointment list.'}
          </p>
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

      {/* Column 3: Staff Notes & Logs (Default Collapsed) */}
      {hasSelection && showNotesPanel && (
        <div className={`xl:w-[350px] lg:w-[320px] flex-col border-l border-card-border/40 min-h-0 overflow-hidden ${colMobile('quickLogs')} flex`}>
          <CoordinationHub
            appointmentId={view.selectedAppointmentId}
            onBack={() => {
              setShowNotesPanel(false);
              setMobileView('detail');
            }}
          />
        </div>
      )}
    </div>
  );
}
