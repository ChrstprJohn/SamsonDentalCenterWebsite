'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileText, Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCoordinationHub } from '../../../hooks/secretary/use-coordination-hub';

interface CoordinationHubProps {
  inquiryId?: string | null;
  appointmentId?: string | null;
  hideHeader?: boolean;
  hideActions?: boolean;
  onBack?: () => void;
}

const parseNoteParts = (rawNote: string) => {
  let title = '';
  let body = '';
  if (rawNote.includes('\n\n')) {
    const parts = rawNote.split(/\n\n([\s\S]*)/);
    title = parts[0]?.trim() || '';
    body = parts[1]?.trim() || '';
  } else if (rawNote.includes('\n')) {
    const parts = rawNote.split(/\n([\s\S]*)/);
    title = parts[0]?.trim() || '';
    body = parts[1]?.trim() || '';
  } else {
    body = rawNote || '';
  }
  return { title, body };
};

export function CoordinationHub({ inquiryId, appointmentId, hideHeader, hideActions, onBack }: CoordinationHubProps) {
  const targetId = appointmentId || inquiryId || null;
  const targetType = appointmentId ? 'appointment' : 'inquiry';
  const { logs, isLoading, error, addLog, removeLog } = useCoordinationHub(targetId, targetType);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;
    setIsSaving(true);
    try {
      const combined = noteTitle.trim()
        ? (noteContent.trim() ? `${noteTitle.trim()}\n\n${noteContent.trim()}` : noteTitle.trim())
        : noteContent.trim();
      await addLog('CUSTOM_NOTE', combined);
      setNoteTitle('');
      setNoteContent('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-card-border/40 bg-sidebar">
      {!hideHeader && (
        <div className="p-4 border-b border-card-border/40 shrink-0 h-14 flex items-center">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {onBack && (
              <button onClick={onBack} className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0" title="Close Notes">
                <ArrowLeft className="size-5" />
              </button>
            )}
            <div className="text-base font-medium text-foreground truncate">
              Notes
            </div>
          </div>
        </div>
      )}

      {!targetId ? null : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>

            {error && (
              <div className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{error}</div>
            )}

            {!hideActions && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-foreground">Add Custom Note</span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Title <span className="text-muted-foreground/60">(optional)</span>
                  </span>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Call Back / Follow Up"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Note Description <span className="text-muted-foreground/60">(optional)</span>
                  </span>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="e.g. Patient preferred morning slot on Thursday, call back pending..."
                    rows={4}
                    className="w-full min-w-0 px-3.5 py-2.5 rounded-xl border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none break-words [overflow-wrap:anywhere]"
                  />
                  <span className="text-[11px] text-muted-foreground text-right">{noteContent.length}/500</span>
                  <Button
                    onClick={handleSaveNote}
                    disabled={(!noteContent.trim() && !noteTitle.trim()) || isSaving}
                    size="sm"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-8"
                  >
                    {isSaving ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </div>
            )}

            <div className={!hideActions ? 'border-t border-card-border/40 pt-4' : ''}>
              <div className="text-sm font-medium text-foreground mb-3">
                {targetType === 'appointment' ? 'Notes on this appointment' : 'Notes on this request'}
              </div>
              {isLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Loading notes...</div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
                    <FileText className="size-5 text-muted-foreground/60" />
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    No notes on this {targetType === 'appointment' ? 'appointment' : 'request'}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">Add a custom note above to get started.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {logs.map((log) => {
                    const { title, body } = parseNoteParts(log.message || '');
                    const createdDate = (() => {
                      try {
                        const d = new Date(log.createdAt);
                        const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                        return `${datePart} · ${timePart}`;
                      } catch {
                        return log.createdAt;
                      }
                    })();

                    return (
                      <div
                        key={log.id}
                        className="group relative w-full flex flex-col text-left text-xs transition-all select-none shrink-0 overflow-hidden rounded-none shadow-sm hover:shadow-md border border-amber-300/60"
                        style={{
                          minHeight: '85px',
                          background: '#fde047',
                          boxShadow: '0 2px 6px 0 rgba(120,100,0,0.12), 0 1px 2px 0 rgba(120,100,0,0.06)',
                        }}
                        title={log.message}
                      >
                        {/* Sticky note top bar / fold line */}
                        <div
                          className="flex items-center justify-between px-2.5 pt-1.5 pb-1 shrink-0"
                          style={{ borderBottom: '1px solid rgba(161,120,0,0.20)' }}
                        >
                          <div
                            className="truncate text-sm leading-none capitalize font-normal"
                            style={{ color: '#92400e' }}
                            title={title}
                          >
                            {title || <span style={{ color: '#a16207', fontWeight: 400, fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>Untitled note</span>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeLog(log.id); }}
                              className="opacity-0 group-hover:opacity-100 hover:text-rose-700 text-amber-800 transition p-0.5"
                              title="Delete note"
                            >
                              <X className="size-3.5" />
                            </button>
                            <Pin
                              className="size-3 rotate-45"
                              style={{ color: '#a16207', opacity: 0.7 }}
                            />
                          </div>
                        </div>

                        {/* Date & time row */}
                        <div className="px-2.5 pt-1 shrink-0">
                          <span className="text-[10px] font-medium leading-none" style={{ color: '#a16207', opacity: 0.85 }}>
                            {createdDate}
                          </span>
                        </div>

                        {/* Note Content Body */}
                        <div className="flex-1 px-2.5 pt-1 pb-2 overflow-hidden">
                          {body ? (
                            <p className="text-[11px] font-normal leading-snug break-words [overflow-wrap:anywhere]" style={{ color: '#78350f' }}>
                              {body}
                            </p>
                          ) : (
                            <p className="text-[11px] italic leading-snug" style={{ color: '#b45309', opacity: 0.6 }}>
                              No description added
                            </p>
                          )}
                        </div>
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
