'use client';

import type { InquiryDecision } from '@/modules/staff/hooks/secretary/use-secretary-inquiries-queue';

export function InquiryDecisionCard({ decision, onDecisionChange }: { decision: InquiryDecision; onDecisionChange: (decision: InquiryDecision) => void }) {
  return (
    <div className="border border-card-border/80 bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2">
      <span className="text-xs font-black text-text-primary uppercase tracking-wider">Decision Action</span>
      <div className="flex gap-2">
        <DecisionButton label="Convert to Appointment" active={decision === 'CONVERT'} tone="convert" onClick={() => onDecisionChange('CONVERT')} />
        <DecisionButton label="Drop Inquiry" active={decision === 'DROP'} tone="drop" onClick={() => onDecisionChange('DROP')} />
      </div>
    </div>
  );
}

function DecisionButton({ label, active, tone, onClick }: { label: string; active: boolean; tone: 'convert' | 'drop'; onClick: () => void }) {
  const activeClass = tone === 'convert'
    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50 shadow-sm font-black'
    : 'bg-rose-500/10 text-rose-500 border-rose-500/50 shadow-sm font-black';
  return <button type="button" onClick={onClick} className={`flex-1 py-3 text-xs font-bold uppercase rounded-xl border transition-all ${active ? activeClass : 'border-card-border bg-card text-text-muted hover:text-text-primary'}`}>{label}</button>;
}
