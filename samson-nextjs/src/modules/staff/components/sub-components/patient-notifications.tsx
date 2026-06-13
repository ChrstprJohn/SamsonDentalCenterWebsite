'use client';

import React from 'react';
import { EmailLog } from '../../hooks/use-secretary-dashboard';

interface PatientNotificationsProps {
  emailLogs: EmailLog[];
  emailSearch: string;
  setEmailSearch: (val: string) => void;
}

export function PatientNotifications({
  emailLogs,
  emailSearch,
  setEmailSearch,
}: PatientNotificationsProps) {
  const filteredEmails = emailLogs.filter((log) =>
    log.recipient.toLowerCase().includes(emailSearch.toLowerCase()) ||
    log.subject.toLowerCase().includes(emailSearch.toLowerCase())
  );

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Patient Notifications</h3>
      <div className="bg-card border border-card-border rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <input
          type="text"
          placeholder="Search recipient or subject..."
          value={emailSearch}
          onChange={(e) => setEmailSearch(e.target.value)}
          className="px-3 py-2 rounded-xl border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring w-full text-text-primary"
        />

        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
          {filteredEmails.map((log, idx) => (
            <div key={idx} className="flex flex-col gap-0.5 p-3 rounded-xl border border-card-border bg-secondary-bg/50 text-[10px]">
              <div className="flex justify-between">
                <span className="font-bold text-text-primary">{log.recipient}</span>
                <span className="text-text-muted">{log.timestamp.split(' ')[1] || log.timestamp}</span>
              </div>
              <span className="text-text-secondary mt-0.5">{log.subject}</span>
              <span className="inline-flex self-start px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-bold uppercase mt-1">
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
