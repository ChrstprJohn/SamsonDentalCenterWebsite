'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Percent, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function CheckInCheckoutModal({ view }: { view: any }) {
  if (!view.checkoutInvoice || !view.checkoutAppt) return null;
  const appt = view.checkoutAppt;
  const invoice = view.checkoutInvoice;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="bg-card border border-card-border rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl relative">
          <button onClick={view.closeCheckout} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary bg-secondary-bg/30 rounded-full"><X className="h-4 w-4" /></button>
          <div className="flex flex-col gap-1 border-b border-card-border/50 pb-3 pr-6"><h2 className="text-base font-black text-text-primary">Checkout & Invoicing</h2><p className="text-xs text-text-muted">Finalize visit record for {appt.patient?.firstName} {appt.patient?.lastName}</p></div>
          <LineItems view={view} />
          <AddLineItem view={view} />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1"><Percent className="h-3 w-3 text-primary-start" />Discount %</label><Input type="number" min={0} max={100} value={view.discountPercent || ''} onChange={(event) => view.setDiscountPercent(Math.max(0, Math.min(100, Number(event.target.value))))} className="text-xs rounded-xl" /></div>
            <div className="flex flex-col gap-1.5"><label className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1"><CreditCard className="h-3 w-3 text-primary-start" />Payment Method</label><Select value={view.paymentMethod} onChange={(event) => view.setPaymentMethod(event.target.value)} className="text-xs rounded-xl bg-card border border-card-border" options={[{ value: 'CASH', label: 'Cash Payment' }, { value: 'CARD', label: 'Credit/Debit Card' }, { value: 'HMO', label: 'HMO / Insurance Carrier' }]} /></div>
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-text-secondary bg-primary-start/5 border border-primary-start/15 p-4 rounded-2xl"><span>Final Billing Total:</span><span className="text-lg font-black text-primary-start">PHP {view.calculateFinalPrice().toFixed(2)}</span></div>
          <div className="flex gap-3 pt-2"><Button onClick={view.closeCheckout} variant="secondary" className="w-full text-xs font-bold h-10 border-none rounded-xl">Cancel</Button><Button onClick={view.handleCheckoutComplete} disabled={view.isPending} className="w-full text-xs font-bold h-10 bg-primary-start border-none rounded-xl">Complete Checkout</Button></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function LineItems({ view }: { view: any }) {
  const appt = view.checkoutAppt;
  const invoice = view.checkoutInvoice;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-0.5"><span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Line Items</span><span className="text-[10px] text-text-muted">Doctor Prescribed</span></div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary-bg/40 border border-card-border/40"><div className="flex flex-col min-w-0"><span className="text-xs font-bold text-text-primary truncate">{appt.service?.name ?? 'Clinical Service'}</span><span className="text-[10px] text-text-muted">Dr. {appt.doctor?.firstName} {appt.doctor?.lastName}</span></div><span className="text-xs font-black text-text-primary ml-3 shrink-0">PHP {invoice.amount.toLocaleString()}</span></div>
        {view.additionalItems.map((item: any, index: number) => <div key={index} className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10"><div className="flex flex-col min-w-0"><span className="text-xs font-bold text-text-primary truncate">{item.description}</span><span className="text-[10px] text-text-muted">Qty: {item.quantity} x PHP {item.unitPrice.toLocaleString()}</span></div><div className="flex items-center gap-3 shrink-0 ml-3"><span className="text-xs font-black text-text-primary">PHP {(item.unitPrice * item.quantity).toLocaleString()}</span><button type="button" onClick={() => view.setAdditionalItems((prev: any[]) => prev.filter((_, itemIndex) => itemIndex !== index))} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="h-3.5 w-3.5" /></button></div></div>)}
      </div>
    </div>
  );
}

function AddLineItem({ view }: { view: any }) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-secondary-bg/25 border border-dashed border-card-border rounded-2xl mt-1">
      <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">Add Additional Service / Retail Item</span>
      <Select value={view.selectedServiceId} onChange={(event) => { const value = event.target.value; view.setSelectedServiceId(value); if (value === 'custom') { view.setCustomDescription(''); view.setCustomPrice(0); } else { const selected = view.servicesCatalog.find((service: any) => service.id === value); if (selected) { view.setCustomDescription(selected.name); view.setCustomPrice(selected.price); } } }} className="text-xs rounded-xl bg-card border border-card-border w-full" options={[{ value: '', label: '-- Select Clinic Service --' }, ...view.servicesCatalog.map((service: any) => ({ value: service.id, label: `${service.name} (PHP ${service.price})` })), { value: 'custom', label: 'Custom Free-text Item...' }]} />
      {view.selectedServiceId !== '' && <div className="grid grid-cols-2 gap-2"><Input type="text" value={view.customDescription} onChange={(event) => view.setCustomDescription(event.target.value)} className="text-xs rounded-xl col-span-2" disabled={view.selectedServiceId !== 'custom'} /><Input type="number" min={0} value={view.customPrice || ''} onChange={(event) => view.setCustomPrice(Number(event.target.value))} className="text-xs rounded-xl" disabled={view.selectedServiceId !== 'custom'} /><Input type="number" min={1} value={view.customQty} onChange={(event) => view.setCustomQty(Math.max(1, Number(event.target.value)))} className="text-xs rounded-xl" /><Button type="button" onClick={view.addLineItem} className="text-[10px] h-8 bg-indigo-500 border-none rounded-xl col-span-2">Add Line Item</Button></div>}
    </div>
  );
}
