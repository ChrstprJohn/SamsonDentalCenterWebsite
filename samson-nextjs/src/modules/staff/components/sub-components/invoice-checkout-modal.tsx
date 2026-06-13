import React from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ActiveInvoiceData {
  patientName: string;
  serviceName: string;
  doctorName: string;
  basePrice: number;
}

interface InvoiceCheckoutModalProps {
  activeInvoice: ActiveInvoiceData | null;
  onClose: () => void;
  discountPercent: number;
  setDiscountPercent: (value: number) => void;
  paymentMethod: 'CARD' | 'CASH' | 'INSURANCE';
  setPaymentMethod: (value: 'CARD' | 'CASH' | 'INSURANCE') => void;
  calculateFinalPrice: (base: number, discount: number) => number;
  handleCheckoutSubmit: (e: React.FormEvent) => void;
  isCheckoutSubmitting: boolean;
}

export function InvoiceCheckoutModal({
  activeInvoice,
  onClose,
  discountPercent,
  setDiscountPercent,
  paymentMethod,
  setPaymentMethod,
  calculateFinalPrice,
  handleCheckoutSubmit,
  isCheckoutSubmitting,
}: InvoiceCheckoutModalProps) {
  return (
    <Modal isOpen={activeInvoice !== null} onClose={onClose} title="Checkout & Finalize Invoice" size="md">
      {activeInvoice && (
        <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 text-sm text-text-secondary py-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-text-muted uppercase tracking-widest">Draft Receipt</span>
            <h4 className="text-base font-bold text-text-primary">{activeInvoice.patientName}</h4>
            <p className="text-xs text-text-muted">
              {activeInvoice.serviceName} | Dr. {activeInvoice.doctorName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-card-border py-4 my-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Apply Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) =>
                  setDiscountPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))
                }
                className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-secondary">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
              >
                <option value="CARD">Credit/Debit Card</option>
                <option value="CASH">Cash Payment</option>
                <option value="INSURANCE">Insurance Claim</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 p-4 bg-secondary-bg rounded-2xl border border-card-border">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Total Due</span>
              <span className="text-lg font-extrabold text-primary-start">
                ${calculateFinalPrice(activeInvoice.basePrice, discountPercent)}
              </span>
            </div>
            <span className="text-xs text-text-muted">
              Base Price: ${activeInvoice.basePrice} | Discount: {discountPercent}%
            </span>
          </div>

          <div className="flex gap-3 justify-end border-t border-card-border pt-4 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={isCheckoutSubmitting}>
              {isCheckoutSubmitting ? 'Checking Out...' : 'Complete & Lock Receipt'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
