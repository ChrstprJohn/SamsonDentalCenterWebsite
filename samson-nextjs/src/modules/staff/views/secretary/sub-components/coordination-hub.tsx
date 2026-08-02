'use client';

import { ArrowLeft, ClipboardList, AlertTriangle, Clock, Stethoscope, RefreshCw, Phone, Voicemail, MessageSquare, Mail, Plus, X } from 'lucide-react';
import { useCoordinationHub } from '../../../hooks/secretary/use-coordination-hub';
import type { CreateCoordinationLogActionType } from '@/modules/appointments/dtos/coordination/coordination-log-response.dto';

interface CoordinationHubProps {
  inquiryId: string | null;
  hideHeader?: boolean;
  hideActions?: boolean;
  onBack?: () => void;
}

interface QuickAction {
  type: CreateCoordinationLogActionType;
  label: string;
  icon: React.ReactNode;
  msg: string;
  classes: string;
}

const CALENDAR_ACTIONS: QuickAction[] = [
  { type: 'SCHEDULE_CONFLICT', label: 'Calendar Conflict', icon: <AlertTriangle className="size-3.5" />, msg: 'Offline calendar conflict detected for requested slot', classes: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
  { type: 'OUTSIDE_HOURS', label: 'Outside Hours', icon: <Clock className="size-3.5" />, msg: 'Requested time falls outside clinic operating hours', classes: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
  { type: 'DR_UNAVAILABLE', label: 'Dr. Unavailable', icon: <Stethoscope className="size-3.5" />, msg: 'Required dentist is not available on requested date', classes: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' },
  { type: 'NEEDS_RESCHEDULE', label: 'Needs Resched', icon: <RefreshCw className="size-3.5" />, msg: 'Slot invalid — rescheduling to different day/time', classes: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
];

const COMMS_ACTIONS: QuickAction[] = [
  { type: 'CALLED_NO_ANSWER', label: 'Called: No Answer', icon: <Phone className="size-3.5" />, msg: 'Called patient — no answer', classes: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' },
  { type: 'LEFT_VOICEMAIL', label: 'Left Voicemail', icon: <Voicemail className="size-3.5" />, msg: 'Left voicemail requesting callback', classes: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' },
  { type: 'SMS_SENT', label: 'SMS Sent', icon: <MessageSquare className="size-3.5" />, msg: 'SMS sent to patient — awaiting reply', classes: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
  { type: 'EMAIL_SENT', label: 'Email Sent', icon: <Mail className="size-3.5" />, msg: 'Email sent with schedule proposal', classes: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
];

const TIMELINE_COLORS: Record<string, string> = {
  SCHEDULE_CONFLICT: 'border-l-amber-400 bg-amber-50/40',
  OUTSIDE_HOURS: 'border-l-orange-400 bg-orange-50/40',
  DR_UNAVAILABLE: 'border-l-red-400 bg-red-50/40',
  WAITING_ON_DOCTOR: 'border-l-purple-400 bg-purple-50/40',
  NEEDS_RESCHEDULE: 'border-l-blue-400 bg-blue-50/40',
  CALLED_NO_ANSWER: 'border-l-slate-300 bg-slate-50/40',
  LEFT_VOICEMAIL: 'border-l-slate-300 bg-slate-50/40',
  SMS_SENT: 'border-l-emerald-400 bg-emerald-50/40',
  EMAIL_SENT: 'border-l-indigo-400 bg-indigo-50/40',
  CUSTOM_NOTE: 'border-l-card-border/50 bg-secondary-bg/30',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function CoordinationHub({ inquiryId, hideHeader, hideActions, onBack }: CoordinationHubProps) {
  const { logs, isLoading, error, customNote, setCustomNote, addLog, removeLog, addCustomNote } = useCoordinationHub(inquiryId);

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-card-border/40 bg-sidebar">
      {!hideHeader && (
        <div className="p-4 border-b border-card-border/40 shrink-0 h-14 flex items-center">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {onBack && (
              <button onClick={onBack} className="xl:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
                <ArrowLeft className="size-5" />
              </button>
            )}
            <div className="text-base font-medium text-foreground truncate">
              Staff Notes &amp; Logs
            </div>
          </div>
        </div>
      )}

      {!inquiryId ? null : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>

            {error && (
              <div className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{error}</div>
            )}

            {!hideActions && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Schedule Conflicts</div>
                <div className="flex flex-wrap gap-1.5">
                  {CALENDAR_ACTIONS.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => addLog(action.type, action.msg)}
                      className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${action.classes}`}
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!hideActions && (
              <div className="border-t border-card-border/40 pt-4">
                <div className="text-xs text-muted-foreground mb-2">Contact Attempts</div>
                <div className="flex flex-wrap gap-1.5">
                  {COMMS_ACTIONS.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => addLog(action.type, action.msg)}
                      className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${action.classes}`}
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!hideActions && (
              <div className="border-t border-card-border/40 pt-4">
                <div className="text-xs text-muted-foreground mb-2">Write Custom Note</div>
                <div className="flex gap-2">
                  <input
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomNote(); } }}
                    placeholder="e.g. Patient preferred morning slot on Thursday"
                    className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-card-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring transition"
                  />
                  <button
                    onClick={addCustomNote}
                    disabled={!customNote.trim()}
                    className="size-[42px] flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition shrink-0"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
              </div>
            )}

            <div className={!hideActions ? 'border-t border-card-border/40 pt-4' : ''}>
              <div className="text-xs text-muted-foreground mb-2">Notes History</div>
              {isLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Loading timeline...</div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
                    <ClipboardList className="size-5 text-muted-foreground/60" />
                  </div>
                  <span className="text-xs font-medium text-foreground">No notes yet</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">Tap a quick action or write a custom note to get started.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {logs.map((log) => {
                    const borderColor = TIMELINE_COLORS[log.actionType] || 'border-l-card-border/50 bg-secondary-bg/30';
                    return (
                      <div key={log.id} className={`group relative border-l-2 rounded-lg p-3 pr-8 ${borderColor}`}>
                        <div className="text-xs text-muted-foreground mb-1">
                          {formatTime(log.createdAt)} - Secretary
                        </div>
                        <div className="text-sm text-foreground leading-relaxed">{log.message}</div>
                        <button
                          onClick={() => removeLog(log.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition p-0.5"
                          title="Delete entry"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
