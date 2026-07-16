'use client';

import { useCoordinationHub } from '../../../hooks/secretary/use-coordination-hub';

interface CoordinationHubProps {
  inquiryId: string | null;
  hideHeader?: boolean;
}

const QUICK_ACTIONS = [
  { type: 'SCHEDULE_CONFLICT', label: 'Schedule Conflict', emoji: '\u26A0\uFE0F', msg: 'Schedule Conflict detected on offline calendar', classes: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
  { type: 'NEEDS_RESCHEDULE', label: 'Needs Resched', emoji: '\uD83D\uDD04', msg: 'Needs Rescheduling \u2013 waiting to finalize slot', classes: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
  { type: 'WAITING_ON_DOCTOR', label: 'Waiting on Dr.', emoji: '\u23F3', msg: 'Waiting for Doctor\u2019s clinical approval', classes: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
  { type: 'CALLED_NO_ANSWER', label: 'No Answer', emoji: '\uD83D\uDCDE', msg: 'Called patient - no answer', classes: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' },
  { type: 'LEFT_VOICEMAIL', label: 'Voicemail', emoji: '\uD83D\uDDE3\uFE0F', msg: 'Left a voicemail requesting callback', classes: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' },
  { type: 'SMS_SENT', label: 'SMS Sent', emoji: '\uD83D\uDCAC', msg: 'SMS Sent (Awaiting patient reply)', classes: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
] as const;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function CoordinationHub({ inquiryId, hideHeader }: CoordinationHubProps) {
  const { logs, isLoading, error, customNote, setCustomNote, addLog, removeLog, addCustomNote } = useCoordinationHub(inquiryId);

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-card-border/40 bg-card/50">
      {!hideHeader && (
        <div className="p-4 border-b border-card-border/40 shrink-0">
          <div className="text-base font-medium text-foreground">
            Quick Status Logs
          </div>
        </div>
      )}

      {!inquiryId ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-text-muted text-center">Select an inquiry to start logging coordination actions.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-3 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>

            {error && (
              <div className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{error}</div>
            )}

            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Quick Notes</div>
              <div className="flex flex-wrap gap-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.type}
                    onClick={() => addLog(action.type, action.msg)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${action.classes}`}
                  >
                    {action.emoji} {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Add Custom Note</div>
              <div className="flex gap-1">
                <input
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomNote(); } }}
                  placeholder="Type a custom update..."
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50 transition"
                />
                <button
                  onClick={addCustomNote}
                  disabled={!customNote.trim()}
                  className="text-xs px-3 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 disabled:opacity-40 transition shrink-0"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Updates Log</div>
              {isLoading ? (
                <div className="py-6 text-center text-xs text-text-muted">Loading timeline...</div>
              ) : logs.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-muted">No entries yet. Use quick actions above to start logging.</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {logs.map((log) => (
                    <div key={log.id} className="group relative bg-secondary-bg/30 border border-card-border/50 rounded-lg p-3 pr-7">
                      <div className="text-xs text-text-muted font-medium mb-0.5">
                        {formatTime(log.createdAt)} - Secretary
                      </div>
                      <div className="text-sm text-text-primary leading-relaxed">{log.message}</div>
                      <button
                        onClick={() => removeLog(log.id)}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-text-muted hover:text-rose-500 transition text-xs leading-none p-0.5"
                        title="Delete entry"
                      >
                        {'\u2715'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
