'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Stethoscope,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
  PhoneCall,
  Calendar,
  ArrowUpRight,
  ArrowLeft,
  User,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { formatTimeAgo, formatShortDate } from '@/shared/utils/date.util';
import { updateWellbeingStatusAction } from '@/modules/wellbeing/actions/update-wellbeing-status.action';
import { createManualWellbeingResponseAction } from '@/modules/wellbeing/actions/create-manual-wellbeing-response.action';
import { useToast } from '@/components/feedback/toast-container';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';

export type FollowUpResponseRow = {
  id: string;
  feeling: string | null;
  note: string | null;
  details: Record<string, any> | null;
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
    label: 'Recovering Well',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: <Check className="size-3" />,
  },
  COMPLETED: {
    label: 'Cleared',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    icon: <CheckCircle2 className="size-3" />,
  },
};

const FEELING_CONFIG: Record<string, { label: string; badgeClass: string; emoji: string }> = {
  FEELING_GREAT: {
    label: 'Feeling Great',
    emoji: '😊',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  OKAY: {
    label: 'Okay / Mild',
    emoji: '🙂',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  NOT_SO_GOOD: {
    label: 'Not Doing Well',
    emoji: '😟',
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
    title: 'Cleared',
    empty: 'No cleared follow-ups.',
    statuses: ['NO_ACTION_NEEDED', 'COMPLETED'],
    icon: <CheckCircle2 className="size-3.5 text-emerald-500" />,
  },
];

export function FollowUpResponsesPanel({
  responses,
  appointmentOptions,
}: {
  responses: FollowUpResponseRow[];
  appointmentOptions: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedItem, setSelectedItem] = useState<FollowUpResponseRow | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Manual entry state
  const [appointmentId, setAppointmentId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [source, setSource] = useState<'PHONE' | 'TEXT' | 'EMAIL'>('PHONE');
  const [feeling, setFeeling] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredResponses = useMemo(() => {
    if (!searchTerm) return responses;
    const q = searchTerm.toLowerCase().trim();
    return responses.filter((r) => {
      const name = (r.appointment?.patientName || r.patientName || '').toLowerCase();
      const service = (r.appointment?.serviceName || '').toLowerCase();
      const doctor = (r.appointment?.doctorName || '').toLowerCase();
      const noteText = (r.note || '').toLowerCase();
      return name.includes(q) || service.includes(q) || doctor.includes(q) || noteText.includes(q);
    });
  }, [responses, searchTerm]);

  const columnsData = useMemo(() => {
    return {
      unresolved: filteredResponses.filter((r) => r.status === 'UNRESOLVED'),
      withDoctor: filteredResponses.filter((r) => r.status === 'WITH_DOCTOR'),
      resolved: filteredResponses.filter((r) => r.status === 'NO_ACTION_NEEDED' || r.status === 'COMPLETED'),
    };
  }, [filteredResponses]);

  const handleSetStatus = async (id: string, newStatus: ResponseStatus) => {
    setUpdatingId(id);
    const res = await updateWellbeingStatusAction({ id, status: newStatus });
    setUpdatingId(null);
    if (!res.success) {
      addToast(res.error, 'error');
      return;
    }
    const label = STATUS_CONFIG[newStatus]?.label || newStatus;
    addToast(`Status updated: ${label}`, 'success');

    // Update selected item in place if active
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus, updatedAt: new Date().toISOString() });
    }
    router.refresh();
  };

  const handleCreate = async () => {
    if (!appointmentId && !patientName.trim()) {
      addToast('Please link an appointment or enter patient name.', 'error');
      return;
    }
    if (!feeling) {
      addToast('Please select how the patient is feeling.', 'error');
      return;
    }
    setIsSubmitting(true);
    const res = await createManualWellbeingResponseAction({
      appointmentId: appointmentId || undefined,
      patientName: appointmentId ? undefined : patientName.trim(),
      feeling: feeling as 'FEELING_GREAT' | 'OKAY' | 'NOT_SO_GOOD',
      note,
      symptoms: symptoms.length > 0 ? symptoms : undefined,
      source,
    });
    setIsSubmitting(false);
    if (!res.success) {
      addToast(res.error, 'error');
      return;
    }
    addToast('Follow-up logged successfully.', 'success');
    setShowModal(false);
    setAppointmentId('');
    setPatientName('');
    setFeeling('');
    setSymptoms([]);
    setNote('');
    router.refresh();
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Board Column */}
      <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden">
        {/* Header toolbar matching Check-In page */}
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <div className="lg:hidden">
                  <SidebarTrigger />
                </div>
                <h1 className="text-base font-medium text-foreground whitespace-nowrap">Patient Follow-Ups</h1>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Monitor recovery & triage patient concerns.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search follow-ups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[120px] sm:w-[160px] md:w-[180px] xl:w-[260px] h-7 xl:h-8 pl-7 pr-2.5 text-xs bg-background border border-border rounded-md text-foreground outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/40"
                />
              </div>

              <Button
                size="sm"
                onClick={() => { setShowModal(true); setSelectedItem(null); }}
                className="h-7 xl:h-8 px-2.5 sm:px-3 text-xs gap-1.5 cursor-pointer font-medium bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors shadow-xs"
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Log Follow-Up</span>
                <span className="sm:hidden">Log</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Kanban Board Columns Container */}
        <div className="flex-1 min-h-0 h-full w-full overflow-hidden">
          <div className={`h-full min-h-0 w-full overflow-x-auto ${(selectedItem || showModal) ? 'hidden lg:block' : 'block'}`}>
            <div
              className="flex flex-row items-stretch h-full min-h-0 overflow-x-auto min-w-full [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              style={{ scrollbarWidth: 'thin' }}
            >
              {KANBAN_COLUMNS.map((col) => {
                const items = columnsData[col.key as keyof typeof columnsData] || [];
                return (
                  <div
                    key={col.key}
                    className="flex flex-col flex-1 min-w-[240px] sm:min-w-[280px] md:min-w-[300px] lg:min-w-0 h-full min-h-0 border-r border-border last:border-r-0"
                  >
                    {/* Column Header */}
                    <div className="flex items-center gap-2 p-2.5 xl:p-3 border-b border-border shrink-0 bg-muted/20">
                      <div className="flex items-center gap-1.5 truncate">
                        {col.icon}
                        <span className="text-xs xl:text-sm font-semibold truncate text-foreground">{col.title}</span>
                      </div>
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 bg-muted text-muted-foreground">
                        {items.length}
                      </span>
                    </div>

                    {/* Column Scrollable Content */}
                    <div
                      data-lenis-prevent
                      className="flex flex-col flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {items.map((r) => {
                        const isSelected = selectedItem?.id === r.id;
                        const patientName = r.appointment?.patientName || r.patientName || 'Patient';
                        const feeling = FEELING_CONFIG[r.feeling ?? ''] || {
                          label: r.feeling || 'Pending',
                          emoji: '📋',
                          badgeClass: 'text-muted-foreground bg-muted/20',
                        };
                        const sourceInfo = SOURCE_CONFIG[r.source] || {
                          label: r.source,
                          icon: <MessageSquare className="size-3 text-muted-foreground" />,
                        };
                        const details = (r.details || {}) as Details;
                        const symptoms = details.symptoms || [];
                        const hasCallBack = details.callBack === 'YES';
                        const hasMedIssue = details.medsTaken === false || details.medsManageable === false;

                        return (
                          <div
                            key={r.id}
                            onClick={() => { setSelectedItem(r); setShowModal(false); }}
                            className={`flex flex-col text-left transition-colors cursor-pointer select-none overflow-hidden border-b border-border p-2.5 xl:p-3 shrink-0 ${
                              isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex flex-col gap-1 xl:gap-1.5">
                              {/* Row 1: Patient Name + Condition/Status Badge */}
                              <div className="flex w-full items-center gap-1.5 min-w-0">
                                <span className="font-medium text-xs xl:text-sm leading-tight truncate text-foreground">
                                  {patientName}
                                </span>
                                <span
                                  className={`ml-auto text-[8px] sm:text-[8.5px] xl:text-[10px] font-semibold uppercase tracking-tight xl:tracking-wider px-1 py-0.5 rounded-xs shrink-0 ${feeling.badgeClass}`}
                                >
                                  {feeling.emoji} {feeling.label}
                                </span>
                              </div>

                              {/* Row 2: Treatment / Service Name */}
                              <span className="font-medium text-[11px] xl:text-xs leading-tight truncate text-muted-foreground">
                                {r.appointment?.serviceName || 'Aftercare Check'}
                              </span>

                              {/* Row 3: Doctor */}
                              <span className="text-[10px] xl:text-xs truncate text-muted-foreground">
                                {r.appointment?.doctorName || 'Samson Dental Clinic'}
                              </span>

                              {/* Row 4: Submitted Time & Channel + Chevron */}
                              <div className="flex w-full items-center gap-1">
                                <span className="text-[10px] xl:text-[11px] truncate text-muted-foreground">
                                  {formatTimeAgo(r.createdAt)} &bull; via {sourceInfo.label}
                                </span>
                                <ChevronRight className="ml-auto size-4 xl:size-5 shrink-0 text-muted-foreground/60" />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                          <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
                            {col.icon}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{col.empty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Detail Drawer / Log Panel */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            key="follow-up-drawer"
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="w-full lg:w-[360px] xl:w-[380px] flex-col bg-sidebar border-l border-border min-h-0 overflow-hidden flex shrink-0"
          >
            <FollowUpDetailPane
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onStatusChange={handleSetStatus}
              updatingId={updatingId}
            />
          </motion.div>
        )}
        {showModal && (
          <motion.div
            key="log-follow-up-panel"
            initial={{ x: 340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 340, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            className="w-full lg:w-[360px] xl:w-[380px] flex-col bg-sidebar border-l border-border min-h-0 overflow-hidden flex shrink-0"
          >
            <LogFollowUpPane
              appointmentOptions={appointmentOptions}
              appointmentId={appointmentId}
              setAppointmentId={setAppointmentId}
              patientName={patientName}
              setPatientName={setPatientName}
              source={source}
              setSource={setSource}
              feeling={feeling}
              setFeeling={setFeeling}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              note={note}
              setNote={setNote}
              isSubmitting={isSubmitting}
              onClose={() => setShowModal(false)}
              onSubmit={handleCreate}
            />
          </motion.div>
        )}
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
      <div className="p-3.5 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-sidebar">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Plus className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground truncate">Log Patient Follow-Up</span>
            <span className="text-[10px] text-muted-foreground truncate">Inbound call, walk-in, or message</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
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
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Link Appointment
          </label>
          <Select
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Patient Name
            </label>
            <Input
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
                  onClick={() => setFeeling(f)}
                  className={`cursor-pointer py-2 px-2 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                    feeling === f
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="text-lg leading-none">{cfg.emoji}</span>
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
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Secretary Notes
          </label>
          <Textarea
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
          className="cursor-pointer text-xs font-semibold"
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
    emoji: '📋',
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

  return (
    <div className="flex flex-col h-full min-h-0 bg-sidebar">
      {/* Pane Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between gap-2 shrink-0 bg-sidebar">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground truncate">{patientName}</span>
            <span className="text-[10px] text-muted-foreground truncate">Follow-Up Case</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
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
                  onClick={() => onStatusChange(item.id, opt)}
                  disabled={updatingId === item.id || isActive}
                  className={`cursor-pointer px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/40'
                  } disabled:opacity-50`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {cfg.icon}
                    <span className="truncate">{cfg.label}</span>
                  </span>
                  {isActive && <Check className="size-3.5 shrink-0 text-primary-foreground" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Box */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Condition</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${feeling.badgeClass}`}
            >
              <span>{feeling.emoji}</span>
              <span>{feeling.label}</span>
            </span>
          </div>

          {/* Critical Indicators */}
          {(hasCallBack || symptoms.length > 0 || hasMedIssue) && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60">
              {hasCallBack && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                  <Phone className="size-3.5 text-rose-600" />
                  <span>Patient requested a phone call.</span>
                </div>
              )}
              {symptoms.length > 0 && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                  <span className="font-semibold">Symptoms: </span>
                  <span>{symptoms.join(', ')}</span>
                </div>
              )}
              {details.medsTaken === false && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                  ⚠️ Patient reported not taking prescribed meds.
                </div>
              )}
              {details.medsManageable === false && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                  ⚠️ Symptoms are not manageable with current meds.
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
            <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed italic bg-muted/30 p-2.5 rounded-lg border border-border/50">
              &ldquo;{item.note}&rdquo;
            </p>
          </div>
        )}

        {/* Clinical / Appointment Context */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Visit & Contact Details
          </span>

          <div className="flex flex-col gap-1.5 text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Source Channel:</span>
              <span className="font-medium text-foreground flex items-center gap-1">
                {sourceInfo.icon}
                {sourceInfo.label}
              </span>
            </div>

            {item.appointment && (
              <>
                <div className="flex items-center justify-between">
                  <span>Procedure:</span>
                  <span className="font-medium text-foreground">{item.appointment.serviceName || 'General Treatment'}</span>
                </div>
                {item.appointment.doctorName && (
                  <div className="flex items-center justify-between">
                    <span>Dentist:</span>
                    <span className="font-medium text-foreground">{item.appointment.doctorName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Visit Date:</span>
                  <span className="font-medium text-foreground">{formatShortDate(item.appointment.date)}</span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <span>Submitted:</span>
              <span className="font-medium text-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>

            {item.updatedAt && (
              <div className="flex items-center justify-between text-[11px]">
                <span>Last Updated:</span>
                <span>{formatTimeAgo(item.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}