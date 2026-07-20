'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface InquiryGuestProfileProps {
  firstName: string; setFirstName: (value: string) => void;
  middleName: string; setMiddleName: (value: string) => void;
  lastName: string; setLastName: (value: string) => void;
  suffix: string; setSuffix: (value: string) => void;
  phone: string; setPhone: (value: string) => void;
  email: string; setEmail: (value: string) => void;
  patientNote: string;
  setPatientNote: (value: string) => void;
  isEditing: boolean;
}

export function InquiryGuestProfile(props: InquiryGuestProfileProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Guest Profile</h3>
        <div className="grid grid-cols-4 gap-4">
          <FieldBlock label="First name">
            {!props.isEditing ? (
              <span className="text-sm font-semibold text-slate-800">{props.firstName || '-'}</span>
            ) : (
              <Input value={props.firstName} onChange={(e) => props.setFirstName(e.target.value)} className="text-sm" />
            )}
          </FieldBlock>
          <FieldBlock label="Middle name">
            {!props.isEditing ? (
              <span className="text-sm font-semibold text-slate-800">{props.middleName || '-'}</span>
            ) : (
              <Input value={props.middleName} onChange={(e) => props.setMiddleName(e.target.value)} className="text-sm" />
            )}
          </FieldBlock>
          <FieldBlock label="Last name">
            {!props.isEditing ? (
              <span className="text-sm font-semibold text-slate-800">{props.lastName || '-'}</span>
            ) : (
              <Input value={props.lastName} onChange={(e) => props.setLastName(e.target.value)} className="text-sm" />
            )}
          </FieldBlock>
          <FieldBlock label="Suffix">
            {!props.isEditing ? (
              <span className="text-sm font-semibold text-slate-800">{props.suffix || '-'}</span>
            ) : (
              <Input value={props.suffix} onChange={(e) => props.setSuffix(e.target.value)} className="text-sm" />
            )}
          </FieldBlock>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FieldBlock label="Email address">
            {!props.isEditing ? (
              <span className="text-sm font-semibold text-slate-800 truncate">{props.email || '-'}</span>
            ) : (
              <Input type="email" value={props.email} onChange={(e) => props.setEmail(e.target.value)} className="text-sm" />
            )}
          </FieldBlock>
          <FieldBlock label="Phone">
            {!props.isEditing ? (
              <span className="text-sm font-semibold text-slate-800">{props.phone || '-'}</span>
            ) : (
              <Input value={props.phone} onChange={(e) => props.setPhone(e.target.value)} className="text-sm" />
            )}
          </FieldBlock>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Patient Note</h3>
        {!props.isEditing ? (
          <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            {props.patientNote || <span className="text-slate-400">-</span>}
          </div>
        ) : (
          <textarea
            value={props.patientNote}
            onChange={(e) => props.setPatientNote(e.target.value)}
            rows={2}
            className="text-sm text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 transition resize-none w-full"
            placeholder="Add a note..."
          />
        )}
      </div>
    </div>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-medium text-slate-400 mb-1">{label}</span>
      {children}
    </div>
  );
}
