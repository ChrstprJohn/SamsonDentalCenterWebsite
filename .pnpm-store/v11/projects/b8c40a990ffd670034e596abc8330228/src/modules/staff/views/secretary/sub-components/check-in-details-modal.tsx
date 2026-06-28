'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CheckInDetailsModal({ view }: { view: any }) {
  if (!view.viewAppt) return null;
  const appointment = view.viewAppt;
  const invoice = view.getFinalizedInvoiceForAppt(appointment.id);
  const subtotal = view.viewInvoiceItems.length > 0 ? view.viewInvoiceItems.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0) : invoice ? invoice.amount + (invoice.discountApplied || 0) : 0;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="bg-card border border-card-border rounded-3xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl relative">
          <button onClick={() => view.setViewAppt(null)} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 rounded-full"><X className="h-4 w-4" /></button>
          <div className="flex flex-col gap-0.5 border-b border-card-border/50 pb-3"><h2 className="text-sm font-black text-text-primary">Completed Visit Log</h2><p className="text-[11px] text-text-muted">Review checkout records</p></div>
          <div className="flex flex-col gap-3.5 text-xs text-text-secondary bg-secondary-bg/30 p-4 rounded-2xl border border-card-border/30">
            <Row label="Patient" value={`${appointment.patient?.firstName} ${appointment.patient?.lastName}`} />
            <Row label="Attending Doctor" value={`Dr. ${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`} />
            <div className="flex flex-col gap-2 border-t border-card-border/30 pt-3"><span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Services & Items:</span>{view.viewInvoiceItems.length > 0 ? view.viewInvoiceItems.map((item: any, index: number) => <div key={item.id || index} className="flex justify-between text-[11px] items-start"><div className="flex flex-col"><span className="font-bold text-text-primary">{item.description}</span><span className="text-[9px] text-text-muted">{item.source === 'DOCTOR_BASELINE' ? 'Doctor Prescribed' : 'Secretary Addition'}</span></div><span className="font-bold text-text-primary">PHP {(item.unit_price * item.quantity).toFixed(2)}</span></div>) : <Row label={`${appointment.service?.name || 'Treatment Service'} (x1)`} value={`PHP ${subtotal.toFixed(2)}`} />}</div>
            {invoice && <div className="border-t border-card-border/40 pt-3 flex flex-col gap-2.5"><Row label="Payment Mode" value={invoice.paymentMethod || ''} /><Row label="Subtotal" value={`PHP ${subtotal.toFixed(2)}`} /><Row label="Discount Applied" value={`PHP ${invoice.discountApplied?.toFixed(2) || '0.00'}`} /><Row label="Total Paid" value={`PHP ${invoice.amount.toFixed(2)}`} /></div>}
          </div>
          <Button onClick={() => view.setViewAppt(null)} variant="secondary" className="w-full text-xs font-bold h-10 border-none rounded-xl mt-1">Close Log</Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between items-center"><span className="text-text-muted">{label}:</span><span className="font-extrabold text-text-primary">{value}</span></div>;
}
