// src/app/(portals)/secretary/invoices/page.tsx
'use client';

import React from 'react';
import { useSecretaryInvoiceManagement } from '@/modules/staff/hooks/secretary/use-secretary-invoice-management';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InvoiceReceiptActions } from './sub-components/invoice-receipt-actions';

export function SecretaryInvoiceManagementView() {
  const {
    searchTerm,
    setSearchTerm,
    methodFilter,
    setMethodFilter,
    selectedInvoiceId,
    setSelectedInvoiceId,
    selectedInvoice,
    filteredInvoices,
  } = useSecretaryInvoiceManagement();

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Invoice Management</h1>
        <p className="text-xs text-text-muted">
          Access records of all finalized transactions, HMO claims, and billing logs.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 border border-card-border bg-card rounded-2xl p-4 shadow-sm">
        <Input
          type="text"
          placeholder="Search invoices by patient, service, dentist..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-xs flex-1"
        />

        <Select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="text-xs sm:w-48"
          options={[
            { value: '', label: 'All Payment Types' },
            { value: 'CASH', label: 'Cash' },
            { value: 'CARD', label: 'Card' },
            { value: 'HMO', label: 'HMO / Insurance' }
          ]}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left Column - Invoices table */}
        <div className="lg:col-span-8 border border-card-border bg-card rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-card-border text-text-muted font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Patient</th>
                  <th className="py-3 px-2">Doctor</th>
                  <th className="py-3 px-2">Method</th>
                  <th className="py-3 px-2">Final Price</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-muted">
                      No invoices found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                        selectedInvoiceId === inv.id ? 'bg-secondary-bg/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-2 font-semibold text-text-primary">{inv.patientName}</td>
                      <td className="py-3.5 px-2 text-text-secondary">{inv.doctorName}</td>
                      <td className="py-3.5 px-2">
                        <Badge variant="info">{inv.paymentMethod}</Badge>
                      </td>
                      <td className="py-3.5 px-2 font-bold text-text-secondary">₱{inv.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Invoice details receipt */}
        <div id="invoice-receipt-pane" className="lg:col-span-4 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4 print:border-none print:shadow-none print:w-full print:fixed print:top-0 print:left-0 print:bg-white print:z-50 print:p-8">
          {selectedInvoice ? (
            <div className="flex flex-col gap-4">
              <div className="border-b border-card-border pb-3 text-center">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Samson Dental Receipt</div>
                <h3 className="text-base font-extrabold text-text-primary mt-1">{selectedInvoice.patientName}</h3>
                <span className="text-[10px] text-text-muted">ID: {selectedInvoice.id.substring(0, 8)}</span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>Treatment:</span>
                  <span className="font-semibold text-text-primary">{selectedInvoice.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dentist:</span>
                  <span className="font-semibold text-text-primary">{selectedInvoice.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold text-text-primary">
                    {new Date(selectedInvoice.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-card-border/40 pt-2.5">
                  <span>Base Price:</span>
                  <span>₱{selectedInvoice.basePrice}</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Discount Applied:</span>
                  <span>{selectedInvoice.discountApplied}%</span>
                </div>
                <div className="flex justify-between font-bold border-t border-card-border/80 pt-2.5 text-text-primary">
                  <span>Total Amount Paid:</span>
                  <span className="text-primary-start text-sm">₱{selectedInvoice.amount}</span>
                </div>
              </div>

              <style jsx global>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #invoice-receipt-pane, #invoice-receipt-pane * {
                    visibility: visible;
                  }
                  #invoice-receipt-pane {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }
              `}</style>

              <InvoiceReceiptActions onPrint={() => window.print()} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-text-muted text-center py-12">
              Select a finalized invoice row from the table to view the digital checkout receipt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
