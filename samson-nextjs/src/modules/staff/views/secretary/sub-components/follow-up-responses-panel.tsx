'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Stethoscope,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Plus,
  ChevronRight,
  X,
  Check,
  SlidersHorizontal,
  Loader2,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { formatTimeAgo, formatShortDate } from '@/shared/utils/date.util';
import { updateWellbeingStatusAction } from '@/modules/wellbeing/actions/update-wellbeing-status.action';
import { createManualWellbeingResponseAction } from '@/modules/wellbeing/actions/create-manual-wellbeing-response.action';
import { useToast } from '@/components/feedback/toast-container';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DEFAULT_FOLLOW_UP_FILTERS, FOLLOW_UP_PERIODS, FOLLOW_UP_STAGES, followUpStatuses, matchesFollowUpFilters, validFollowUpDate, type FollowUpFilters } from './follow-up-filters';

function isResolvedFollowUp(status: string) { return status === 'NO_ACTION_NEEDED' || status === 'COMPLETED'; }

export type FollowUpResponseRow = {
  id: string;
  feeling: string | null;
  note: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  status: string;
  source: string;
  updatedAt: string | null;
  patientName: string | null;
  patientPhone?: string | null;
  appointment?: {
    id: string;
    date: string;
    patientName: string;
    serviceName: string | null;
    doctorName?: string | null;
    phone?: string | null;
  } | null;
};

const STATUS_OPTIONS = ['UNRESOLVED', 'WITH_DOCTOR', 'NO_ACTION_NEEDED', 'COMPLETED'] as const;
type ResponseStatus = (typeof STATUS_OPTIONS)[number];

const STATUS_CONFIG: Record<
  ResponseStatus,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  UNRESOLVED: {
    label: 'Awaiting Review',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    icon: <AlertCircle className="size-3" />,
  },
  WITH_DOCTOR: {
    label: 'Under Review',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: <Stethoscope className="size-3" />,
  },
  NO_ACTION_NEEDED: {
    label: 'No further action',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: <Check className="size-3" />,
  },
  COMPLETED: {
    label: 'Cleared',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: <CheckCircle2 className="size-3" />,
  },
};

const FEELING_CONFIG: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  FEELING_GREAT: {
    label: 'Feeling Great',
    icon: <Smile className="size-3.5 shrink-0" />,
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  OKAY: {
    label: 'Okay / Mild',
    icon: <Meh className="size-3.5 shrink-0" />,
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  NOT_SO_GOOD: {
    label: 'Not Doing Well',
    icon: <Frown className="size-3.5 shrink-0" />,
    badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold',
  },
};

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  PHONE: { label: 'Phone', icon: <Phone className="size-3 text-sky-600" /> },
  TEXT: { label: 'SMS', icon: <MessageSquare className="size-3 text-violet-600" /> },
  EMAIL: { label: 'Email', icon: <Mail className="size-3 text-sky-600" /> },
  FORM: { label: 'Form', icon: <Mail className="size-3 text-sky-600" /> },
};

const SYMPTOM_OPTIONS = ['Pain', 'Swelling', 'Bleeding', 'Fever', 'Nausea', 'Other'] as const;

type Details = { medsTaken?: boolean; medsManageable?: boolean; symptoms?: string[]; callBack?: 'YES' | 'NO' };

const KANBAN_COLUMNS = [
  {
    key: 'unresolved',
    title: 'Awaiting Review',
    empty: 'No items awaiting review.',
    statuses: ['UNRESOLVED'],
    icon: <AlertCircle className="size-3.5 text-rose-500" />,
  },
  {
    key: 'withDoctor',
    title: 'Under Review',
    empty: 'No cases currently with dentist.',
    statuses: ['WITH_DOCTOR'],
    icon: <Stethoscope className="size-3.5 text-amber-500" />,
  },
  {
    key: 'resolved',
    title: 'Resolved',
    empty: 'No resolved follow-ups.',
    statuses: ['NO_ACTION_NEEDED', 'COMPLETED'],
    icon: <CheckCircle2 className="size-3.5 text-emerald-500" />,
  },
];

export function FollowUpResponsesPanel({
  responses,
  appointmentOptions,
  filters = DEFAULT_FOLLOW_UP_FILTERS,
}: {
  responses: FollowUpResponseRow[];
  appointmentOptions: Array<{ id: string; label: string }>;
  filters?: FollowUpFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [filterError, setFilterError] = useState('');
  const [isFiltering, startFilterTransition] = useTransition();
  const filtersRef = useRef<HTMLDetailsElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(72);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, { status: string; updatedAt: string }>>({});

  const [appointmentId, setAppointmentId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [source, setSource] = useState<'PHONE' | 'TEXT' | 'EMAIL'>('PHONE');
  const [feeling, setFeeling] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Keep successful changes visible until refreshed server data catches up.
  const currentResponses = useMemo(() => responses.map(row => {
    const update = statusUpdates[row.id];
    return update && new Date(update.updatedAt).getTime() > new Date(row.updatedAt || row.createdAt).getTime() ? { ...row, ...update } : row;
  }), [responses, statusUpdates]);
  const selectedItem = currentResponses.find(row => row.id === selectedId) ?? null;
  const paneOpen = Boolean(selectedItem || showModal);
  const filteredResponses = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return currentResponses.filter(row => matchesFollowUpFilters(row, filters) && (!q || [row.appointment?.patientName, row.patientName, row.appointment?.serviceName, row.appointment?.doctorName, row.note].some(value => value?.toLowerCase().includes(q))));
  }, [currentResponses, searchTerm, filters]);
  const columnsData = {
    unresolved: filteredResponses.filter(row => row.status === 'UNRESOLVED'),
    withDoctor: filteredResponses.filter(row => row.status === 'WITH_DOCTOR'),
    resolved: filteredResponses.filter(row => isResolvedFollowUp(row.status)),
  };
  const matchingStatuses = followUpStatuses(filters.stage);
  const visibleColumns = KANBAN_COLUMNS.filter(column => !matchingStatuses || column.statuses.some(status => matchingStatuses.includes(status)));
  const stageLabels: Record<FollowUpFilters['stage'], string> = { ALL: 'All stages', ACTIVE: 'Active cases', UNRESOLVED: 'Awaiting review', WITH_DOCTOR: 'Under review', NO_ACTION_NEEDED: 'No further action', COMPLETED: 'Cleared' };
  const periodLabels: Record<FollowUpFilters['period'], string> = { ALL: 'All dates', TODAY: 'Today', WEEK: 'Last 7 days', MONTH: 'This month', RANGE: 'Custom range' };
  const hasFilters = filters.stage !== 'ALL' || filters.period !== 'ALL' || filters.dateField !== 'REPORTED';

  useEffect(() => {
    if (paneOpen) drawerRef.current?.querySelector<HTMLButtonElement>('[data-close]')?.focus();
  }, [paneOpen]);
  useEffect(() => {
    const header = toolbarRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      const height = header.getBoundingClientRect().height;
      if (height > 0) setToolbarHeight(height);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (filtersRef.current?.open && !filtersRef.current.contains(event.target as Node)) filtersRef.current.open = false;
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);
  const closePane = () => {
    setSelectedId(null);
    setShowModal(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const applyFilters = (next: FollowUpFilters) => {
    if (next.period === 'RANGE' && (!validFollowUpDate(next.from) || !validFollowUpDate(next.to) || next.from > next.to)) {
      setFilterError('Choose a valid start and end date. The end date must be on or after the start date.');
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    ['stage', 'period', 'dateField', 'from', 'to'].forEach(key => params.delete(key));
    if (next.stage !== 'ALL') params.set('stage', next.stage);
    if (next.period !== 'ALL') params.set('period', next.period);
    if (next.dateField !== 'REPORTED') params.set('dateField', next.dateField);
    if (next.period === 'RANGE') { params.set('from', next.from); params.set('to', next.to); }
    if (filtersRef.current) filtersRef.current.open = false;
    setSelectedId(null);
    setShowModal(false);
    startFilterTransition(() => router.replace(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false }));
  };

  const handleSetStatus = async (id: string, newStatus: ResponseStatus) => {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const result = await updateWellbeingStatusAction({ id, status: newStatus });
      if (!result.success) { addToast(result.error, 'error'); return; }
      setStatusUpdates(current => ({ ...current, [id]: { status: newStatus, updatedAt: result.data.updatedAt } }));
      addToast(`Status updated: ${STATUS_CONFIG[newStatus].label}`, 'success');
      router.refresh();
    } catch {
      addToast('Unable to update the follow-up. Please try again.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };
  const handleCreate = async () => {
    if (!appointmentId && !patientName.trim()) { addToast('Please link an appointment or enter patient name.', 'error'); return; }
    if (!feeling) { addToast('Please select how the patient is feeling.', 'error'); return; }
    setIsSubmitting(true);
    try {
      const result = await createManualWellbeingResponseAction({ appointmentId: appointmentId || undefined, patientName: appointmentId ? undefined : patientName.trim(), feeling: feeling as 'FEELING_GREAT' | 'OKAY' | 'NOT_SO_GOOD', note, symptoms: symptoms.length ? symptoms : undefined, source });
      if (!result.success) { addToast(result.error, 'error'); return; }
      addToast('Follow-up logged successfully.', 'success');
      setShowModal(false);
      setAppointmentId(''); setPatientName(''); setFeeling(''); setSymptoms([]); setNote('');
      router.refresh();
    } catch {
      addToast('Unable to log the follow-up. Your entries have been kept. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ '--follow-up-toolbar-height': `${toolbarHeight}px` } as React.CSSProperties} className="relative flex h-full min-h-0 w-full overflow-hidden" onKeyDown={event => { if (event.key === 'Escape' && paneOpen) closePane(); }}>
      <div className={`min-w-0 flex-1 min-h-0 flex-col overflow-hidden ${paneOpen ? 'hidden lg:flex' : 'flex'}`}>
        <header ref={toolbarRef} className="shrink-0 border-b border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><div className="lg:hidden"><SidebarTrigger /></div><h1 className="truncate text-base font-medium text-foreground">Patient Follow-Ups</h1></div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground" title="Review patient reports and track each case through resolution.">Review patient reports and track each case through resolution.</p>
            </div>
            <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-[110px] xl:w-[180px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input aria-label="Search follow-ups" placeholder="Search follow-ups…" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2.5 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
              </div>
              <details ref={filtersRef} className="relative" onToggle={event => { if (event.currentTarget.open) { setDraftFilters(filters); setFilterError(''); } }} onKeyDown={event => { if (event.key === 'Escape' && filtersRef.current?.open) { event.stopPropagation(); filtersRef.current.open = false; filtersRef.current.querySelector('summary')?.focus(); } }}>
                <summary className="flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden"><SlidersHorizontal className="size-3.5" />Filters{hasFilters && <span className="size-1.5 rounded-full bg-foreground" aria-label="Filters applied" />}</summary>
                <form aria-label="Follow-up filters" className="absolute right-0 top-full z-30 mt-2 flex w-[min(320px,calc(100vw-32px))] flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-lg" onSubmit={event => { event.preventDefault(); applyFilters(draftFilters); }}>
                  <h2 className="font-semibold text-foreground">Filter follow-ups</h2>
                  <div><label htmlFor="follow-up-stage" className="mb-1.5 block text-sm font-medium">Stage</label><Select id="follow-up-stage" value={draftFilters.stage} onChange={event => setDraftFilters({ ...draftFilters, stage: event.target.value as FollowUpFilters['stage'] })} options={FOLLOW_UP_STAGES.map(value => ({ value, label: stageLabels[value] }))} /></div>
                  <div><label htmlFor="follow-up-period" className="mb-1.5 block text-sm font-medium">Period</label><Select id="follow-up-period" value={draftFilters.period} onChange={event => setDraftFilters({ ...draftFilters, period: event.target.value as FollowUpFilters['period'] })} options={FOLLOW_UP_PERIODS.map(value => ({ value, label: periodLabels[value] }))} /></div>
                  <div><label htmlFor="follow-up-date-field" className="mb-1.5 block text-sm font-medium">Date to filter</label><Select id="follow-up-date-field" value={draftFilters.dateField} onChange={event => setDraftFilters({ ...draftFilters, dateField: event.target.value as FollowUpFilters['dateField'] })} options={[{ value: 'REPORTED', label: 'Reported date' }, { value: 'UPDATED', label: 'Last updated date' }]} /><p className="mt-1.5 text-xs text-muted-foreground">Use last updated to find recently cleared cases. Dates use Philippine time.</p></div>
                  {draftFilters.period === 'RANGE' && <div className="grid grid-cols-2 gap-3"><div><label htmlFor="follow-up-from" className="mb-1.5 block text-sm font-medium">From</label><Input id="follow-up-from" type="date" required value={draftFilters.from} max={draftFilters.to || undefined} onChange={event => setDraftFilters({ ...draftFilters, from: event.target.value })} /></div><div><label htmlFor="follow-up-to" className="mb-1.5 block text-sm font-medium">To</label><Input id="follow-up-to" type="date" required value={draftFilters.to} min={draftFilters.from || undefined} onChange={event => setDraftFilters({ ...draftFilters, to: event.target.value })} /></div></div>}
                  {filterError && <p role="alert" className="text-sm text-destructive">{filterError}</p>}
                  <div className="flex justify-between gap-2"><Button type="button" variant="outline" size="sm" onClick={() => applyFilters(DEFAULT_FOLLOW_UP_FILTERS)}>Reset</Button><Button type="submit" variant="outline" size="sm" className="border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background">Apply filters</Button></div>
                </form>
              </details>
              <Button aria-label="Log Follow-Up" variant="outline" size="sm" className="h-8 gap-1.5 rounded-md border-foreground bg-foreground px-2.5 text-xs text-background hover:bg-foreground/90 hover:text-background" onClick={event => { triggerRef.current = event.currentTarget; setShowModal(true); setSelectedId(null); }}><Plus className="size-3.5" /><span className="sm:hidden xl:inline">Log Follow-Up</span></Button>
            </div>
          </div>
          {(hasFilters || isFiltering) && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
            {hasFilters && <><span>· {stageLabels[filters.stage]} · {filters.period === 'RANGE' ? `${filters.from} to ${filters.to}` : periodLabels[filters.period]}</span>{filters.period !== 'ALL' && <span>· {filters.dateField === 'UPDATED' ? 'Last updated' : 'Reported date'}</span>}<button type="button" className="min-h-8 px-1 font-medium text-foreground underline underline-offset-4" onClick={() => applyFilters(DEFAULT_FOLLOW_UP_FILTERS)}>Clear filters</button></>}
            {isFiltering && <span className="inline-flex items-center gap-1"><Loader2 className="size-3 animate-spin" />Updating…</span>}
          </div>}
        </header>
        <div aria-busy={isFiltering} className={`min-h-0 flex-1 overflow-hidden ${isFiltering ? 'pointer-events-none opacity-60' : ''}`}>
          <div className="flex h-full min-h-0 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
            {visibleColumns.map(column => {
              const items = columnsData[column.key as keyof typeof columnsData];
              return <section key={column.key} aria-label={column.title} className="flex h-full min-h-0 min-w-[200px] flex-1 flex-col border-r border-border last:border-r-0 xl:min-w-0">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-2.5 xl:p-3"><h2 className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-foreground xl:text-sm">{column.icon}{column.title}</h2><span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground" aria-label={`${items.length} cases`}>{items.length}</span></div>
                <div data-lenis-prevent className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {items.map(row => {
                    const name = row.appointment?.patientName || row.patientName || 'Patient';
                    const resolved = isResolvedFollowUp(row.status);
                    const status = STATUS_CONFIG[row.status as ResponseStatus] ?? STATUS_CONFIG.UNRESOLVED;
                    const reported = FEELING_CONFIG[row.feeling ?? ''];
                    const sourceInfo = SOURCE_CONFIG[row.source] ?? { label: row.source, icon: <MessageSquare className="size-3" /> };
                    const selected = selectedId === row.id;
                    return <button key={row.id} type="button" aria-label={`Open follow-up for ${name}`} aria-pressed={selected} onClick={event => { triggerRef.current = event.currentTarget; setSelectedId(row.id); setShowModal(false); }} className={`flex min-w-0 shrink-0 flex-col gap-1.5 border-b border-border p-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring xl:p-3 ${selected ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                      <div className="flex min-w-0 flex-wrap items-center justify-between gap-1.5"><span className="min-w-0 break-words text-xs font-medium text-foreground xl:text-sm">{name}</span><span className={`inline-flex shrink-0 items-center gap-1 rounded-xs px-1 py-0.5 text-[10px] font-semibold ${status.badgeClass}`}>{status.icon}{status.label}</span></div>
                      <p className="break-words text-[11px] font-medium text-muted-foreground xl:text-xs">{row.appointment?.serviceName || 'Aftercare check'}</p>
                      <div className={`flex items-center gap-1.5 text-[10px] xl:text-xs ${resolved ? 'text-muted-foreground' : reported?.badgeClass.includes('rose') ? 'text-rose-700 dark:text-rose-300' : 'text-muted-foreground'}`}>{reported?.icon ?? <MessageSquare className="size-3" />}<span>Reported: {reported?.label || row.feeling || 'Not specified'}</span></div>
                      {row.appointment?.doctorName && <p className="text-[10px] text-muted-foreground xl:text-xs">{row.appointment.doctorName}</p>}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground xl:text-[11px]"><span>{resolved ? `Updated ${formatTimeAgo(row.updatedAt || row.createdAt)}` : `Reported ${formatTimeAgo(row.createdAt)}`}</span><span className="inline-flex items-center gap-1">{sourceInfo.icon}{sourceInfo.label}</span><ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/60" /></div>
                    </button>;
                  })}
                  {!items.length && <div className="flex flex-col items-center justify-center px-4 py-12 text-center"><div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-muted/30">{column.icon}</div><p className="text-xs font-medium text-foreground">{searchTerm || hasFilters ? 'No follow-ups match these filters.' : column.empty}</p></div>}
                </div>
              </section>;
            })}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {paneOpen && <motion.div ref={drawerRef} key={showModal ? 'log-follow-up-panel' : 'follow-up-drawer'} role="complementary" aria-label={showModal ? 'Log follow-up' : 'Follow-up details'} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.16 }} className="absolute inset-0 z-20 flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-l border-border bg-sidebar lg:static lg:w-[320px] xl:w-[360px]">
          {selectedItem && !showModal ? <FollowUpDetailPane item={selectedItem} onClose={closePane} onStatusChange={handleSetStatus} updatingId={updatingId} /> : <LogFollowUpPane appointmentOptions={appointmentOptions} appointmentId={appointmentId} setAppointmentId={setAppointmentId} patientName={patientName} setPatientName={setPatientName} source={source} setSource={setSource} feeling={feeling} setFeeling={setFeeling} symptoms={symptoms} setSymptoms={setSymptoms} note={note} setNote={setNote} isSubmitting={isSubmitting} onClose={closePane} onSubmit={handleCreate} />}
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}
function LogFollowUpPane({
  appointmentOptions,
  appointmentId,
  setAppointmentId,
  patientName,
  setPatientName,
  source,
  setSource,
  feeling,
  setFeeling,
  symptoms,
  setSymptoms,
  note,
  setNote,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  appointmentOptions: Array<{ id: string; label: string }>;
  appointmentId: string;
  setAppointmentId: (v: string) => void;
  patientName: string;
  setPatientName: (v: string) => void;
  source: 'PHONE' | 'TEXT' | 'EMAIL';
  setSource: (v: 'PHONE' | 'TEXT' | 'EMAIL') => void;
  feeling: string;
  setFeeling: (v: string) => void;
  symptoms: string[];
  setSymptoms: (v: string[]) => void;
  note: string;
  setNote: (v: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-sidebar">
      {/* Pane Header */}
      <div style={{ height: 'var(--follow-up-toolbar-height, 72px)' }} className="p-4 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-sidebar max-lg:!h-[75px]">
        <div className="flex flex-col min-w-0 gap-0.5">
          <h2 className="font-medium text-base text-foreground truncate">Log Patient Follow-Up</h2>
          <p className="text-xs text-muted-foreground truncate">Inbound call, walk-in, or message</p>
        </div>
        <button
          type="button"
          data-close
          aria-label="Close log follow-up"
          onClick={onClose}
          className="size-8 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Pane Body */}
      <div
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 text-xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Link Appointment */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="follow-up-appointment" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Link Appointment
          </label>
          <Select
            id="follow-up-appointment"
            value={appointmentId}
            onChange={(e) => {
              setAppointmentId(e.target.value);
              if (e.target.value) setPatientName('');
            }}
            className="w-full text-xs"
            options={[
              { value: '', label: '-- Or enter name manually below --' },
              ...appointmentOptions.map((opt) => ({ value: opt.id, label: opt.label })),
            ]}
          />
        </div>

        {/* Patient Name (manual) */}
        {!appointmentId && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="follow-up-patient" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Patient Name
            </label>
            <Input
              id="follow-up-patient"
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Maria Santos"
              className="text-xs"
            />
          </div>
        )}

        {/* Contact Channel */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Contact Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['PHONE', 'TEXT', 'EMAIL'] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={source === s}
                onClick={() => setSource(s)}
                className={`cursor-pointer py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  source === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {SOURCE_CONFIG[s].icon}
                <span>{SOURCE_CONFIG[s].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* How is patient feeling */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Patient Condition
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['FEELING_GREAT', 'OKAY', 'NOT_SO_GOOD'] as const).map((f) => {
              const cfg = FEELING_CONFIG[f];
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={feeling === f}
                  onClick={() => setFeeling(f)}
                  className={`cursor-pointer py-2 px-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                    feeling === f
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                  }`}
                >
              <span>{cfg.icon}</span>
                  <span className="text-[11px] leading-tight text-center">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Reported Symptoms <span className="normal-case font-normal">(Optional)</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SYMPTOM_OPTIONS.map((sym) => {
              const active = symptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSymptoms(active ? symptoms.filter((s) => s !== sym) : [...symptoms, sym]);
                  }}
                  className={`cursor-pointer px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="follow-up-notes" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Secretary Notes
          </label>
          <Textarea
            id="follow-up-notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Record patient concerns, doctor follow-up instructions, or medications discussed..."
            rows={4}
            className="text-xs"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="shrink-0 p-3.5 border-t border-border bg-sidebar flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
          className="cursor-pointer text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isSubmitting}
          variant="outline"
          className="cursor-pointer text-xs font-semibold border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background"
        >
          {isSubmitting ? 'Saving...' : 'Save Follow-Up'}
        </Button>
      </div>
    </div>
  );
}

function FollowUpDetailPane({
  item,
  onClose,
  onStatusChange,
  updatingId,
}: {
  item: FollowUpResponseRow;
  onClose: () => void;
  onStatusChange: (id: string, status: ResponseStatus) => void;
  updatingId: string | null;
}) {
  const patientName = item.appointment?.patientName || item.patientName || 'Patient';
  const phoneNumber = item.appointment?.phone || item.patientPhone;
  const feeling = FEELING_CONFIG[item.feeling ?? ''] || {
    label: item.feeling || 'Not specified',
    icon: <MessageSquare className="size-3.5" />,
    badgeClass: 'bg-muted text-muted-foreground',
  };
  const sourceInfo = SOURCE_CONFIG[item.source] || {
    label: item.source,
    icon: <MessageSquare className="size-3 text-muted-foreground" />,
  };
  const details = (item.details || {}) as Details;
  const symptoms = details.symptoms || [];
  const hasCallBack = details.callBack === 'YES';
  const hasMedIssue = details.medsTaken === false || details.medsManageable === false;
  const resolved = isResolvedFollowUp(item.status);
  const indicatorClass = resolved ? 'bg-muted/30 border-border text-muted-foreground' : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300';
  const medicationClass = resolved ? 'bg-muted/30 border-border text-muted-foreground' : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300';

  return (
    <div className="flex flex-col h-full min-h-0 bg-sidebar">
      {/* Pane Header */}
      <div style={{ height: 'var(--follow-up-toolbar-height, 72px)' }} className="p-4 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-sidebar max-lg:!h-[75px]">
        <div className="flex flex-col min-w-0 gap-0.5">
          <h2 className="font-medium text-base text-foreground truncate">{patientName}</h2>
          <p className="text-xs text-muted-foreground truncate">Follow-Up Case</p>
        </div>
        <button
          type="button"
          data-close
          aria-label="Close follow-up details"
          onClick={onClose}
          className="size-8 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Pane Body */}
      <div
        data-lenis-prevent
        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 text-xs [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Status Stage Switcher */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Stage / Status
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const cfg = STATUS_CONFIG[opt];
              const isActive = item.status === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onStatusChange(item.id, opt)}
                  disabled={!!updatingId || isActive}
                  className={`cursor-pointer px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                  } ${updatingId ? 'opacity-50' : ''}`}
                >
                  <span className="flex items-center gap-1.5">
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </span>
                  {isActive && <Check className="size-3.5 shrink-0 text-primary-foreground" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Box */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reported Condition</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${resolved ? 'bg-muted text-muted-foreground' : feeling.badgeClass}`}
            >
              {feeling.icon}
              <span>{feeling.label}</span>
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{resolved ? 'Original patient report. This case is resolved; the report is kept for reference.' : 'Patient condition at the time this follow-up was reported.'}</p>

          {/* Critical Indicators */}
          {(hasCallBack || symptoms.length > 0 || hasMedIssue) && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60">
              {hasCallBack && (
                <div className={`p-2 rounded-lg border font-semibold flex items-center gap-1.5 ${indicatorClass}`}>
                  <Phone className="size-3.5" />
                  <span>Phone call requested in original report.</span>
                </div>
              )}
              {symptoms.length > 0 && (
                <div className={`p-2 rounded-lg border ${indicatorClass}`}>
                  <span className="font-semibold">Symptoms: </span>
                  <span>{symptoms.join(', ')}</span>
                </div>
              )}
              {details.medsTaken === false && (
                <div className={`p-2 rounded-lg border ${medicationClass}`}>
                  Patient reported not taking prescribed meds.
                </div>
              )}
              {details.medsManageable === false && (
                <div className={`p-2 rounded-lg border ${medicationClass}`}>
                  Patient reported symptoms were not manageable with current meds.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Patient Note */}
        {item.note && (
          <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <MessageSquare className="size-3.5 text-primary" />
              <span>Feedback Notes</span>
            </div>
            <p className="text-xs text-foreground/90 whitespace-pre-line break-words leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
              {item.note}
            </p>
          </div>
        )}

        {/* Clinical / Appointment Context */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Visit & Contact Details
          </span>

          <div className="flex flex-col gap-1.5 text-muted-foreground">
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3">
              <span>Source Channel:</span>
              <span className="font-medium text-foreground flex items-center justify-end gap-1">
                {sourceInfo.icon}
                {sourceInfo.label}
              </span>
            </div>

            {item.appointment && (
              <>
                <div className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3">
                  <span>Procedure:</span>
                  <span className="font-medium text-foreground text-right break-words">{item.appointment.serviceName || 'General Treatment'}</span>
                </div>
                {item.appointment.doctorName && (
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3">
                    <span>Dentist:</span>
                    <span className="font-medium text-foreground text-right break-words">{item.appointment.doctorName}</span>
                  </div>
                )}
                <div className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3">
                  <span>Visit Date:</span>
                  <span className="font-medium text-foreground text-right">{formatShortDate(item.appointment.date)}</span>
                </div>
              </>
            )}

            {phoneNumber && <div className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3"><span>Phone:</span><a className="text-right break-words font-medium text-foreground underline underline-offset-2" href={`tel:${phoneNumber}`}>{phoneNumber}</a></div>}
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3">
              <span>Submitted:</span>
              <span className="font-medium text-foreground text-right">{new Date(item.createdAt).toLocaleDateString('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {item.updatedAt && (
              <div className="grid grid-cols-[90px_minmax(0,1fr)] items-start gap-3 text-[11px]">
                <span>Last Updated:</span>
                <span className="text-right">{formatTimeAgo(item.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
