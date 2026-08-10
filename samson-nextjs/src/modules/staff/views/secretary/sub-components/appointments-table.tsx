'use client';

import { CalendarDays, ChevronLeft, ChevronRight, Globe, GlobeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AppointmentDirectoryTab } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import { formatClinicTime, formatRelativeDay, formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme, SecretaryRefreshBar } from './secretary-list-skeleton';

const BADGE_STYLES: Record<string, string> = {
  APPROVED: 'text-blue-600 bg-blue-500/10 dark:text-blue-400',
  CHECKED_IN: 'text-cyan-600 bg-cyan-500/10 dark:text-cyan-400',
  COMPLETED: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
  CANCELLED: 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
  REJECTED: 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
  NO_SHOW: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
  DISPLACED: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
};

const PAGE_SIZE = 25;

interface AppointmentsTableProps {
  appointments: AppointmentDto[];
  total: number;
  selectedAppointmentId: string | null;
  isLoading: boolean;
  isRefreshing?: boolean;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  canGoNewer: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  onGoNewer: () => void;
  formatPatientName: (appointment: AppointmentDto) => string;
  onSelect: (appointmentId: string) => void;
  activeTab?: AppointmentDirectoryTab;
  onQuickAction?: () => void;
}

export function AppointmentsTable(props: AppointmentsTableProps) {
  if (props.isLoading) {
    return (
      <div className="flex-1 min-h-0 overflow-hidden" data-lenis-prevent>
        <SecretaryListSkeletonTheme>
          <div className="flex flex-col">
            {Array.from({ length: 7 }, (_, index) => (
              <div key={index} className="flex flex-col items-start w-full gap-2 border-b p-4 last:border-b-0 text-sm leading-tight">
                <div className="flex w-full items-center justify-between gap-2">
                  <SecretaryListSkeleton width={128} height={20} />
                  <SecretaryListSkeleton width={64} height={16} borderRadius="9999px" />
                </div>
                <SecretaryListSkeleton width={160} height={20} />
                <div className="w-full flex items-center justify-between gap-2">
                  <SecretaryListSkeleton width={144} height={16} />
                  <SecretaryListSkeleton width={80} height={12} />
                </div>
              </div>
            ))}
          </div>
        </SecretaryListSkeletonTheme>
      </div>
    );
  }

  if (props.error && props.appointments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2.5">
          <CalendarDays className="size-5 text-destructive/70" />
        </div>
        <span className="text-xs font-medium text-foreground">Could not load appointments</span>
        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">{props.error}</p>
        <Button variant="outline" size="sm" onClick={props.onRetry} className="mt-3 h-8 text-xs">
          Retry
        </Button>
      </div>
    );
  }

  if (!props.error && props.appointments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
          <CalendarDays className="size-5 text-muted-foreground/60" />
        </div>
        <span className="text-xs font-medium text-foreground">No appointments found</span>
        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">Try adjusting your search query or tab filter.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
{props.isRefreshing && <SecretaryRefreshBar />}
      <div className="flex flex-col">
        {props.error && (
          <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <div className="flex items-center justify-between gap-3">
              <span>Could not refresh appointments. {props.error}</span>
              <Button variant="outline" size="sm" onClick={props.onRetry} className="h-7 shrink-0 text-xs">
                Retry
              </Button>
            </div>
          </div>
        )}
        {props.appointments.map((appointment) => (
          <AppointmentRow
            key={appointment.id}
            appointment={appointment}
            isSelected={props.selectedAppointmentId === appointment.id}
            formatPatientName={props.formatPatientName}
            onSelect={props.onSelect}
            activeTab={props.activeTab}
            onQuickAction={props.onQuickAction}
          />
        ))}
        {props.loadMoreError && (
          <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <div className="flex items-center justify-between gap-3">
              <span>Could not load more appointments. {props.loadMoreError}</span>
              <Button variant="outline" size="sm" onClick={props.onLoadMore} className="h-7 shrink-0 text-xs">
                Retry
              </Button>
            </div>
          </div>
        )}
        {props.hasMore ? (
          <div className="flex items-center justify-between border-t px-3 py-2">
            <span className="text-[11px] text-muted-foreground">
              Page {Math.max(1, Math.ceil(props.appointments.length / PAGE_SIZE))} of {Math.max(1, Math.ceil(props.total / PAGE_SIZE))}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={props.onGoNewer}
                disabled={!props.canGoNewer}
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                title="Newer appointments"
              >
                <ChevronLeft className="size-3.5" /> Newer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={props.onLoadMore}
                disabled={props.isLoadingMore}
                className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                title="Older appointments"
              >
                {props.isLoadingMore ? 'Loading…' : 'Older'} <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          props.appointments.length > 0 && (
            <div className="border-t py-2.5 text-center text-[11px] text-muted-foreground">
              1–{props.appointments.length} of {props.total} · Page {Math.max(1, Math.ceil(props.appointments.length / PAGE_SIZE))} of {Math.max(1, Math.ceil(props.total / PAGE_SIZE))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function AppointmentRow({ appointment, isSelected, formatPatientName, onSelect, activeTab, onQuickAction }: { appointment: AppointmentDto; isSelected: boolean; formatPatientName: (appointment: AppointmentDto) => string; onSelect: (id: string) => void; activeTab?: AppointmentDirectoryTab; onQuickAction?: () => void }) {
  const status = appointment.status;
  const showQuickAction = activeTab === 'upcoming' && status === 'NO_SHOW' && !appointment.noShowResolvedAt && !!onQuickAction;
  const timeDisplay = appointment.startTime && appointment.endTime
    ? `${formatClinicTime(appointment.startTime)} - ${formatClinicTime(appointment.endTime)}`
    : appointment.preferredStartTime
      ? `Pref: ${formatTimeString(appointment.preferredStartTime)}`
      : 'Time Pending';

  const dateDisplay = formatShortDate(appointment.date);
  const relativeDay = formatRelativeDay(appointment.date);
  const isManual = appointment.source === 'STAFF_CREATED';
  const sourceTitle = isManual ? 'Created manually by staff' : appointment.source === 'CONVERTED' ? 'From online request' : 'Booked online';

  return (
    <button
      onClick={() => onSelect(appointment.id)}
      className={`flex flex-col items-start w-full gap-2 border-b border-card-border/40 p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
        isSelected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-foreground'
      }`}
    >
      <div className="flex w-full items-center gap-2">
      <span className="min-w-0 truncate">{formatPatientName(appointment)}</span>
        <span title={sourceTitle} className="shrink-0 text-muted-foreground/70">
          {isManual ? <GlobeOff className="size-3.5" /> : <Globe className="size-3.5" />}
        </span>
        <span className={`ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${BADGE_STYLES[status] || 'text-muted-foreground bg-muted/20'}`}>
          {status === 'APPROVED' ? 'Confirmed' : status === 'NO_SHOW' && activeTab === 'upcoming' ? 'No-Show (Today)' : status}
        </span>
        {showQuickAction && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onQuickAction(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onQuickAction(); } }}
            className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Resolve
          </span>
        )}
      </div>
      <span className="font-medium truncate">
        {appointment.service?.name || 'Treatment'}
      </span>
      <div className="w-full flex items-center justify-between gap-2 text-xs">
        <span className="truncate">{relativeDay ? `${relativeDay} · ` : ''}{dateDisplay} &bull; {timeDisplay}</span>
        <span className="text-[10px] text-muted-foreground shrink-0">{appointment.doctor ? `Dr. ${appointment.doctor.lastName}` : ''}</span>
      </div>
    </button>
  );
}
