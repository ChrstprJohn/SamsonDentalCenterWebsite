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
  isEditing: boolean;
  onToggle: () => void;
}

export function InquiryGuestProfile(props: InquiryGuestProfileProps) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          👤 1. GUEST PROFILE
        </h4>
        <button 
          type="button" 
          onClick={props.onToggle} 
          className="text-xs font-bold text-primary hover:underline shrink-0"
        >
          {props.isEditing ? '[ Save ]' : '[ Edit ]'}
        </button>
      </div>

      {props.isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in fade-in duration-200">
          <SmallInput label="First Name" value={props.firstName} onChange={props.setFirstName} className="sm:col-span-2" />
          <SmallInput label="Middle Name" value={props.middleName} onChange={props.setMiddleName} />
          <SmallInput label="Last Name" value={props.lastName} onChange={props.setLastName} />
          <SmallInput label="Suffix" value={props.suffix} onChange={props.setSuffix} />
          <SmallInput label="Phone" value={props.phone} onChange={props.setPhone} className="sm:col-span-2" />
          <SmallInput type="email" label="Email" value={props.email} onChange={props.setEmail} className="sm:col-span-2" />
        </div>
      ) : (
        <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Name:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 break-words">
            {props.firstName} {props.middleName ? `${props.middleName} ` : ''}{props.lastName}
          </span>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suffix:</span>
          <span className="text-slate-700 dark:text-slate-300 break-words">
            {props.suffix || 'N/A'}
          </span>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date of Birth:</span>
          <span className="text-slate-700 dark:text-slate-300">
            N/A
          </span>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone:</span>
          <span className="text-slate-700 dark:text-slate-300 break-words">
            {props.phone || 'No phone'}
          </span>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email:</span>
          <span className="text-slate-700 dark:text-slate-300 break-all">
            {props.email || 'No email'}
          </span>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Patient Note:</span>
          <span className="italic text-slate-700 dark:text-slate-300 break-words whitespace-pre-wrap">
            &quot;{props.patientNote || 'No special instructions provided'}&quot;
          </span>
        </div>
      )}
    </div>
  );
}

function SmallInput({ label, value, onChange, type = 'text', className = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[9px] font-bold text-text-muted uppercase">{label}</label>
      <Input 
        type={type} 
        value={value} 
        onChange={(event) => onChange(event.target.value)} 
        className="text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-text-primary rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-ring" 
      />
    </div>
  );
}
