'use client';

import React from 'react';
import { AuditRecord } from '../../hooks/use-secretary-dashboard';

interface AuditTimelineProps {
  audits: AuditRecord[];
}

export function AuditTimeline({ audits }: AuditTimelineProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Secretary Audit Timeline</h3>
      <div className="border border-card-border rounded-3xl overflow-hidden bg-card divide-y divide-card-border">
        {audits.map((item, idx) => (
          <div key={idx} className="p-5 flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-start">
              <span className="inline-flex px-2 py-0.5 rounded bg-accent-blue-bg text-accent-blue-text font-bold text-[9px] uppercase tracking-wider">
                {item.action}
              </span>
              <span className="text-[10px] text-text-muted">{item.timestamp}</span>
            </div>
            <p className="text-text-secondary leading-relaxed mt-1">{item.details}</p>
            <span className="text-[10px] text-text-muted">Actor: {item.actor}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
