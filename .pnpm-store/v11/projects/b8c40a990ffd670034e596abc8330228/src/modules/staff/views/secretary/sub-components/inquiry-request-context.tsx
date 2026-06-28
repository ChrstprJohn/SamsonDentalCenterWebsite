'use client';

export function InquiryRequestContext({ inquiry }: { inquiry: any }) {
  return (
    <div className="border border-card-border bg-secondary-bg/5 rounded-2xl p-4 flex flex-col gap-2 text-xs">
      <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Initial Request Context</div>
      <div className="grid grid-cols-2 gap-2 text-text-secondary">
        <div><span className="text-text-muted">Requested Service:</span> <span className="font-semibold text-text-primary">{inquiry.preferredServiceName}</span></div>
        <div><span className="text-text-muted">Requested Date:</span> <span className="font-semibold text-text-primary">{inquiry.preferredDate}</span></div>
      </div>
      {inquiry.patientNote && <div className="mt-1 text-[11px] italic text-text-muted bg-card p-2 rounded-lg border border-card-border/40">&quot;{inquiry.patientNote}&quot;</div>}
    </div>
  );
}
