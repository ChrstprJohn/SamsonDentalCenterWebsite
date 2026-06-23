// src/app/(portals)/secretary/audits/page.tsx
'use client';

import React, { useState } from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function AuditLogPage() {
  const { audits } = useSecretary();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filteredAudits = audits.filter((aud) => {
    const matchesSearch =
      aud.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aud.targetName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter ? aud.action === actionFilter : true;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Audit Logs</h1>
        <p className="text-xs text-text-muted">
          Read-only history tracking security modifications, config changes, and booking confirmations.
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-3 border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <Input
          type="text"
          placeholder="Filter audit logs by staff or target name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs flex-1"
        />

        <Select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-xs sm:w-56"
          options={[
            { value: '', label: 'All Action Types' },
            { value: 'APPROVE_BOOKING', label: 'Approve Booking' },
            { value: 'REJECT_BOOKING', label: 'Reject Booking' },
            { value: 'CANCEL_BOOKING', label: 'Cancel Booking' },
            { value: 'RESCHEDULE_BOOKING', label: 'Reschedule Booking' },
            { value: 'COMPLETE_CHECKOUT', label: 'Complete Checkout' },
            { value: 'CREATE_MANUAL_BOOKING', label: 'Create Booking' }
          ]}
        />
      </div>

      {/* Audit Logs table */}
      <div className="border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                <th className="py-3 px-2">Timestamp</th>
                <th className="py-3 px-2">Actor</th>
                <th className="py-3 px-2">Action Type</th>
                <th className="py-3 px-2">Target</th>
                <th className="py-3 px-2">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    No matching audit entries.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((aud) => (
                  <tr
                    key={aud.id}
                    className="border-b border-card-border/40 hover:bg-secondary-bg/10 transition-colors"
                  >
                    <td className="py-3.5 px-2 text-text-muted">
                      {new Date(aud.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-text-primary">{aud.actorName}</td>
                    <td className="py-3.5 px-2 font-mono text-[10px] text-primary-start">{aud.action}</td>
                    <td className="py-3.5 px-2 text-text-secondary">{aud.targetName}</td>
                    <td className="py-3.5 px-2 text-text-muted max-w-xs truncate">
                      {aud.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
