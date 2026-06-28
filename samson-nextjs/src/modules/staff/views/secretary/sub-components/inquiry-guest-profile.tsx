'use client';

import { Input } from '@/components/ui/input';

interface InquiryGuestProfileProps {
  firstName: string; setFirstName: (value: string) => void;
  middleName: string; setMiddleName: (value: string) => void;
  lastName: string; setLastName: (value: string) => void;
  suffix: string; setSuffix: (value: string) => void;
  phone: string; setPhone: (value: string) => void;
  email: string; setEmail: (value: string) => void;
}

export function InquiryGuestProfile(props: InquiryGuestProfileProps) {
  return (
    <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-3">
      <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex justify-between items-center">
        <span>Guest Profile Details</span>
        <span className="text-[9px] bg-primary-start/15 text-primary-start px-2 py-0.5 rounded-md font-black uppercase">Editable</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <SmallInput label="First Name" value={props.firstName} onChange={props.setFirstName} className="sm:col-span-2" />
        <SmallInput label="Middle Name" value={props.middleName} onChange={props.setMiddleName} />
        <SmallInput label="Last Name" value={props.lastName} onChange={props.setLastName} />
        <SmallInput label="Suffix" value={props.suffix} onChange={props.setSuffix} />
        <SmallInput label="Phone" value={props.phone} onChange={props.setPhone} className="sm:col-span-2" />
        <SmallInput type="email" label="Email" value={props.email} onChange={props.setEmail} className="sm:col-span-2" />
      </div>
    </div>
  );
}

function SmallInput({ label, value, onChange, type = 'text', className = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  return <div className={`flex flex-col gap-1 ${className}`}><label className="text-[9px] font-bold text-text-muted uppercase">{label}</label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="text-xs py-1.5 px-2.5" /></div>;
}
