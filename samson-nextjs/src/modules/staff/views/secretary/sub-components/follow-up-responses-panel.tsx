'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, MessageSquare, Phone, Mail, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/feedback/toast-container';
import { formatTimeAgo, formatShortDate } from '@/shared/utils/date.util';
import { updateWellbeingStatusAction } from '@/modules/wellbeing/actions/update-wellbeing-status.action';
import { createManualWellbeingResponseAction } from '@/modules/wellbeing/actions/create-manual-wellbeing-response.action';

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
  appointment?: {
    date: string;
    patientName: string;
    serviceName: string | null;
  } | null;
};

const STATUS_OPTIONS = ['UNRESOLVED', 'NO_ACTION_NEEDED', 'WITH_DOCTOR', 'COMPLETED'] as const;
type ResponseStatus = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLE: Record<ResponseStatus, { label: string; className: string }> = {
  UNRESOLVED: { label: 'UNRESOLVED', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  NO_ACTION_NEEDED: { label: 'NO ACTION NEEDED', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  WITH_DOCTOR: { label: 'WITH DOCTOR', className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400' },
  COMPLETED: { label: 'COMPLETED', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
};

const FEELING_LABEL: Record<string, { label: string; className: string }> = {
  FEELING_GREAT: { label: '😊 Feeling Great', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  OKAY: { label: '🙂 Okay', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
  NOT_SO_GOOD: { label: '😟 Not So Good', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' },
};

const SYMPTOM_OPTIONS = ['Pain', 'Swelling', 'Bleeding', 'Fever', 'Nausea', 'Other'] as const;

const SOURCE_OPTIONS = [
  { v: 'PHONE' as const, label: '📞 Phone' },
  { v: 'TEXT' as const, label: '💬 Text' },
  { v: 'EMAIL' as const, label: '✉️ Email' },
];

type Details = { medsTaken?: boolean; medsManageable?: boolean; symptoms?: string[]; callBack?: 'YES' | 'NO' };

function redFlagScore(r: FollowUpResponseRow): number {
  const details = (r.details || {}) as Details;
  const flags =
    (r.feeling === 'NOT_SO_GOOD' ? 1 : 0) +
    (details.callBack === 'YES' ? 1 : 0) +
    (details.medsTaken === false || details.medsManageable === false ? 1 : 0);
  return r.status === 'UNRESOLVED' ? 1 + flags : 0;
}

export function FollowUpResponsesPanel({
  responses,
  appointmentOptions,
}: {
  responses: FollowUpResponseRow[];
  appointmentOptions: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'UNRESOLVED'>('UNRESOLVED');

  const [showModal, setShowModal] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [source, setSource] = useState<'PHONE' | 'TEXT' | 'EMAIL'>('PHONE');
  const [feeling, setFeeling] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unresolved = responses.filter((r) => r.status === 'UNRESOLVED').length;
  const visible = responses
    .filter((r) => filter === 'ALL' || r.status === 'UNRESOLVED')
    .sort((a, b) => redFlagScore(b) - redFlagScore(a) || b.createdAt.localeCompare(a.createdAt));

  const handleSetStatus = async (id: string, status: ResponseStatus) => {
    setUpdatingId(id);
    const res = await updateWellbeingStatusAction({ id, status });
    setUpdatingId(null);
    setOpenMenuId(null);
    if (!res.success) {
      addToast(res.error, 'error');
      return;
    }
    router.refresh();
  };

  const handleCreate = async () => {
    if (!appointmentId && !patientName.trim()) {
      addToast('Link an appointment or enter the patient name.', 'error');
      return;
    }
    if (!feeling) {
      addToast('Select a mood.', 'error');
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
    addToast('Check-in logged.', 'success');
    setShowModal(false);
    setAppointmentId('');
    setPatientName('');
    setFeeling('');
    setSymptoms([]);
    setNote('');
    router.refresh();
  };

  return (
    <section className="rounded-2xl border border-card-border bg-card p-4 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground/60" />
          <h2 className="text-sm font-semibold text-foreground">Aftercare Check-Ins</h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{responses.length}</span>
          {unresolved > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              {unresolved} need attention
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowModal(true)} className="gap-1">
          <Plus className="size-3.5" /> Log Check-In
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Aftercare contact across email form, calls, and texts. Routine replies auto-resolve; log only contacts that need attention.
      </p>

      {responses.length > 0 && (
        <div className="flex gap-1.5">
          {([
            { v: 'UNRESOLVED' as const, label: 'Needs attention' },
            { v: 'ALL' as const, label: 'All' },
          ]).map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => setFilter(t.v)}
              className={`cursor-pointer text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                filter === t.v
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-card-border hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted/30">
            <MessageSquare className="size-5 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {responses.length === 0 ? 'No aftercare check-ins yet.' : 'Nothing needs attention.'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {responses.length === 0
              ? 'Check-ins appear here when patients answer the wellbeing form, or log one manually for calls and texts.'
              : 'Routine replies are auto-resolved. Nice work.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {visible.map((r) => {
            const statusStyle = STATUS_STYLE[r.status as ResponseStatus] || {
              label: r.status,
              className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
            };
            const feeling = FEELING_LABEL[r.feeling ?? ''] || { label: r.feeling || '—', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
            const details = (r.details || {}) as Details;
            const symptoms = details.symptoms || [];
            const note = r.note && r.note.length > 140 ? `${r.note.slice(0, 140)}…` : r.note;
            const name = r.appointment?.patientName || r.patientName || 'Patient';
            const expanded = expandedId === r.id;
            return (
              <div
                key={r.id}
                className="py-2.5 border-b border-card-border/40 last:border-b-0 hover:bg-muted/20 transition-colors rounded-lg cursor-pointer"
                onClick={() => setExpandedId(expanded ? null : r.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ChevronRight className={`size-3.5 text-muted-foreground/60 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                      <span className="text-xs font-medium text-foreground">{name}</span>
                      {r.source === 'PHONE' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          <Phone className="size-3" /> Called
                        </span>
                      )}
                      {r.source === 'TEXT' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          💬 Texted
                        </span>
                      )}
                      {r.source === 'EMAIL' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                          <Mail className="size-3" /> Emailed
                        </span>
                      )}
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${feeling.className}`}>
                        {feeling.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {symptoms.length > 0 && (
                        <>
                          {symptoms.slice(0, 4).map((s) => (
                            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{s}</span>
                          ))}
                          {symptoms.length > 4 && <span className="text-[10px] text-muted-foreground">+{symptoms.length - 4}</span>}
                        </>
                      )}
                      {(details.medsTaken === false || details.medsManageable === false) && (
                        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">Meds concern</span>
                      )}
                      {details.callBack === 'YES' && (
                        <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">Callback requested</span>
                      )}
                    </div>
                    {note && <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>}
                    {r.status !== 'UNRESOLVED' && r.updatedAt && (
                      <p className="text-[10px] text-muted-foreground/70">
                        · flagged {formatTimeAgo(r.updatedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer hover:ring-2 hover:ring-primary-ring/50 transition-shadow ${statusStyle.className}`}
                        title="Change status"
                      >
                        {statusStyle.label}
                      </button>
                      {openMenuId === r.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-xl border border-card-border bg-card shadow-lg p-1 flex flex-col">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSetStatus(r.id, opt)}
                                disabled={updatingId === r.id || opt === r.status}
                                className={`cursor-pointer text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                                  opt === r.status
                                    ? 'bg-muted/40 text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                                } disabled:opacity-50`}
                              >
                                {STATUS_STYLE[opt].label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {r.status === 'UNRESOLVED' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetStatus(r.id, 'NO_ACTION_NEEDED');
                        }}
                        disabled={updatingId === r.id}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="size-3" /> No action needed
                      </button>
                    )}
                    <span className="text-right text-xs text-muted-foreground font-mono text-[11px] whitespace-nowrap" title={r.createdAt}>
                      {formatTimeAgo(r.createdAt)}
                    </span>
                  </div>
                </div>
                {expanded && (
                  <div className="mt-3 ml-5 pl-3 border-l border-card-border/60 flex flex-col gap-2">
                    {r.appointment && (
                      <p className="text-[11px] text-muted-foreground">
                        Appointment: {formatShortDate(r.appointment.date)}
                        {r.appointment.serviceName ? ` · ${r.appointment.serviceName}` : ''}
                      </p>
                    )}
                    {!r.appointment && (
                      <p className="text-[11px] text-muted-foreground">Not linked to an appointment.</p>
                    )}
                    {r.note && <p className="text-xs text-foreground leading-relaxed">{r.note}</p>}
                    {symptoms.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {symptoms.map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    )}
                    {(details.medsTaken === false || details.medsManageable === false) && (
                      <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        {details.medsTaken === false ? 'Did not take prescribed meds. ' : ''}
                        {details.medsManageable === false ? 'Meds not manageable. ' : ''}
                      </p>
                    )}
                    {details.callBack === 'YES' && (
                      <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400">Patient requested a callback.</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                      Logged {new Date(r.createdAt).toLocaleString()}
                      {r.updatedAt ? ` · status updated ${new Date(r.updatedAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-card-border bg-card p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Log Check-In (Call / Text / Email)</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 -mr-1 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <Select
              label="Appointment (optional)"
              value={appointmentId}
              onChange={(e) => {
                setAppointmentId(e.target.value);
                if (e.target.value) setPatientName('');
              }}
              options={[{ value: '', label: 'Select a completed appointment…' }, ...appointmentOptions.map((o) => ({ value: o.id, label: o.label }))]}
            />
            {appointmentOptions.length === 0 && (
              <p className="text-[11px] text-muted-foreground -mt-2">No completed appointments found.</p>
            )}
            {!appointmentId && (
              <Input
                label="Patient name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Required if no appointment linked"
                maxLength={120}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Source</label>
              <div className="flex gap-2">
                {SOURCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setSource(opt.v)}
                    className={`cursor-pointer flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      source === opt.v
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-card text-text-secondary border-card-border hover:border-teal-500/50 hover:text-text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Select
              label="How is the patient feeling?"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              options={[
                { value: '', label: 'Select a mood…' },
                { value: 'FEELING_GREAT', label: '😊 Feeling Great' },
                { value: 'OKAY', label: '🙂 Okay' },
                { value: 'NOT_SO_GOOD', label: '😟 Not So Good' },
              ]}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Symptoms <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      setSymptoms((prev) =>
                        prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
                      )
                    }
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      symptoms.includes(symptom)
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-card text-text-secondary border-card-border hover:border-teal-500/50 hover:text-text-primary'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did the patient say? (optional)"
              rows={3}
              maxLength={2000}
            />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={isSubmitting || (!appointmentId && !patientName.trim()) || !feeling}
              >
                {isSubmitting ? 'Saving...' : 'Log Check-In'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}