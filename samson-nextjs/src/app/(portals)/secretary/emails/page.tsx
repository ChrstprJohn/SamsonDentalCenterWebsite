// src/app/(portals)/secretary/emails/page.tsx
'use client';

import React, { useState } from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function EmailLogPage() {
  const { emails } = useSecretary();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId);

  const filteredEmails = emails.filter(
    (e) =>
      e.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Email Logs</h1>
        <p className="text-xs text-text-muted">
          Read-only audit record of all system-sent notification emails and OTP verification messages.
        </p>
      </div>

      <div className="flex border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <Input
          type="text"
          placeholder="Filter logs by recipient email or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs flex-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Table */}
        <div className="lg:col-span-8 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Recipient</th>
                  <th className="py-3 px-2">Subject</th>
                  <th className="py-3 px-2">Date & Time</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-muted">
                      No matching email logs.
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((eml) => (
                    <tr
                      key={eml.id}
                      onClick={() => setSelectedEmailId(eml.id)}
                      className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                        selectedEmailId === eml.id ? 'bg-secondary-bg/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-2 font-semibold text-text-primary">{eml.recipient}</td>
                      <td className="py-3.5 px-2 text-text-secondary">{eml.subject}</td>
                      <td className="py-3.5 px-2 text-text-muted">
                        {new Date(eml.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2">
                        <Badge variant="success">{eml.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details HTML Body View */}
        <div className="lg:col-span-4 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
          {selectedEmail ? (
            <div className="flex flex-col gap-4">
              <div className="border-b border-card-border pb-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {selectedEmail.type} Log Details
                </span>
                <h3 className="text-sm font-extrabold text-text-primary mt-1">{selectedEmail.recipient}</h3>
                <span className="text-[10px] text-text-muted">{new Date(selectedEmail.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <span className="text-text-muted font-medium">Subject:</span>
                <span className="text-text-primary font-semibold">{selectedEmail.subject}</span>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-card-border/50 pt-3">
                <span className="text-xs font-bold text-text-secondary">Message Content</span>
                <div className="bg-secondary-bg/30 border border-card-border/40 rounded-xl p-4 text-xs font-mono text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.content || 'Content not logged for security privacy.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select an email entry from the table to inspect the delivery headers and text contents.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
