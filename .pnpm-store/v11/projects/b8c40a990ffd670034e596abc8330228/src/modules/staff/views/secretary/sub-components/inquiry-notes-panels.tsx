'use client';

export function InquirySecretaryNotes({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="border border-card-border bg-secondary-bg/10 rounded-2xl p-4 flex flex-col gap-2">
      <label className="text-xs font-bold text-text-primary uppercase">Secretary Call Notes (Status Reason)</label>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="Add notes about the conversion or call details..." rows={3} className="w-full text-xs p-3 rounded-xl border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50" />
    </div>
  );
}

export function InquiryDropReason({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-3 animate-fadeIn">
      <div className="border border-card-border bg-rose-500/5 rounded-2xl p-4 flex flex-col gap-2">
        <label className="text-xs font-bold text-text-primary uppercase">Reason for Dropping *</label>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="Please specify why this inquiry is being dropped/rejected..." rows={4} className="w-full text-xs p-3 rounded-xl border border-card-border bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-start/50" />
        <span className="text-[10px] text-text-muted">* Required field for drop auditing.</span>
      </div>
    </div>
  );
}
