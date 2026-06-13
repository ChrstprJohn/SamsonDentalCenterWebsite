'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DraftInvoice } from '../../hooks/use-secretary-dashboard';

interface CheckoutQueueProps {
  draftInvoices: DraftInvoice[];
  setActiveInvoice: (invoice: DraftInvoice | null) => void;
}

export function CheckoutQueue({ draftInvoices, setActiveInvoice }: CheckoutQueueProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Checkout Queue</h3>
      <div className="flex flex-col gap-4">
        {draftInvoices.map((di) => (
          <div
            key={di.id}
            className="p-5 rounded-2xl border border-card-border bg-card flex flex-col gap-4 hover:shadow-md"
          >
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Draft Invoice</span>
              <h4 className="font-bold text-text-primary mt-1">{di.patientName}</h4>
              <span className="text-[10px] text-text-muted mt-0.5">{di.serviceName} | Dr. {di.doctorName.replace('Dr. ', '')}</span>
            </div>
            <div className="flex justify-between items-center border-t border-card-border pt-3">
              <span className="text-sm font-extrabold text-text-primary">${di.basePrice}</span>
              <Button size="sm" onClick={() => setActiveInvoice(di)}>
                Check-Out
              </Button>
            </div>
          </div>
        ))}

        {draftInvoices.length === 0 && (
          <div className="text-center py-8 border border-dashed border-card-border rounded-2xl text-xs text-text-muted">
            No draft invoices awaiting checkout.
          </div>
        )}
      </div>
    </section>
  );
}
