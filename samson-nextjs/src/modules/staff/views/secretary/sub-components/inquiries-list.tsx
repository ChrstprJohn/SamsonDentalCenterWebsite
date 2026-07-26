'use client';

import { ClipboardList } from 'lucide-react';

interface InquiriesListProps {
  inquiries: any[];
  selectedInquiryId: string | null;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onSelect: (inquiry: any) => void;
}

export function InquiriesList(props: InquiriesListProps) {
  return (
    <div className="lg:col-span-5 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-bold text-text-primary">Active Inquiries ({props.inquiries.length})</div>
        {props.error && <button onClick={props.onRetry} className="text-[10px] text-primary-start font-bold uppercase hover:underline">Retry</button>}
      </div>
      <div className="overflow-x-auto flex-1">
        {props.isLoading ? (
          <div className="flex flex-col gap-2.5 p-2.5">{[1, 2, 3, 4].map((item) => <div key={item} className="h-14 bg-secondary-bg/25 animate-pulse rounded-2xl" />)}</div>
        ) : props.error ? (
          <div className="py-12 text-center text-xs text-rose-500 font-semibold bg-rose-500/5 rounded-2xl border border-rose-500/10">{props.error}</div>
        ) : props.inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
              <ClipboardList className="size-5 text-muted-foreground/60" />
            </div>
            <span className="text-xs font-medium text-foreground">No active inquiries</span>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">Incoming booking requests will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                <th className="py-3 px-2">Guest Name</th>
                <th className="py-3 px-2">Service</th>
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {props.inquiries.map((inquiry) => <InquiryRow key={inquiry.id} inquiry={inquiry} isSelected={props.selectedInquiryId === inquiry.id} onSelect={props.onSelect} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InquiryRow({ inquiry, isSelected, onSelect }: { inquiry: any; isSelected: boolean; onSelect: (inquiry: any) => void }) {
  return (
    <tr onClick={() => onSelect(inquiry)} className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${isSelected ? 'bg-secondary-bg/50' : ''}`}>
      <td className="py-3.5 px-2 font-semibold text-text-primary">{inquiry.firstName} {inquiry.middleName ? `${inquiry.middleName} ` : ''}{inquiry.lastName} {inquiry.suffix || ''}</td>
      <td className="py-3.5 px-2 text-text-secondary">{inquiry.preferredServiceName}</td>
      <td className="py-3.5 px-2 text-text-muted font-medium">{inquiry.preferredDate}</td>
      <td className="py-3.5 px-2 text-text-muted">{inquiry.phoneNumber}</td>
    </tr>
  );
}
