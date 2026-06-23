// src/app/(portals)/secretary/invoices/page.tsx
'use client';

import React, { useState } from 'react';
import { useSecretary } from '@/modules/staff/hooks/use-secretary.hook';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function InvoiceManagementPage() {
  const { invoices } = useSecretary();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [selectedInvId, setSelectedInvId] = useState<string | null>(null);

  const finalizedInvoices = invoices.filter((i) => i.status === 'FINALIZED');
  const selectedInv = finalizedInvoices.find((i) => i.id === selectedInvId);

  const filteredInvoices = finalizedInvoices.filter((inv) => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter ? inv.paymentMethod === methodFilter : true;

    return matchesSearch && matchesMethod;
  });

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
                      onClick={() => setSelectedInvId(inv.id)}
                      className={`border-b border-card-border/40 hover:bg-secondary-bg/20 cursor-pointer transition-colors ${
                        selectedInvId === inv.id ? 'bg-secondary-bg/50' : ''
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
        <div className="lg:col-span-4 border border-card-border bg-card rounded-3xl p-6 shadow-md flex flex-col gap-4">
          {selectedInv ? (
            <div className="flex flex-col gap-4">
              <div className="border-b border-card-border pb-3 text-center">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Samson Dental Receipt</div>
                <h3 className="text-base font-extrabold text-text-primary mt-1">{selectedInv.patientName}</h3>
                <span className="text-[10px] text-text-muted">ID: {selectedInv.id.substring(0, 8)}</span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>Treatment:</span>
                  <span className="font-semibold text-text-primary">{selectedInv.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dentist:</span>
                  <span className="font-semibold text-text-primary">{selectedInv.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold text-text-primary">
                    {new Date(selectedInv.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-card-border/40 pt-2.5">
                  <span>Base Price:</span>
                  <span>₱{selectedInv.basePrice}</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Discount Applied:</span>
                  <span>{selectedInv.discountApplied}%</span>
                </div>
                <div className="flex justify-between font-bold border-t border-card-border/80 pt-2.5 text-text-primary">
                  <span>Total Amount Paid:</span>
                  <span className="text-primary-start text-sm">₱{selectedInv.amount}</span>
                </div>
              </div>

              <div className="flex gap-2 border-t border-card-border/80 pt-4 mt-2">
                <Button className="flex-1 text-xs" variant="secondary" onClick={() => alert('Opening Print dialog...')}>
                  Print Receipt
                </Button>
                <Button className="flex-1 text-xs" variant="secondary" onClick={() => alert('PDF generation initiated...')}>
                  Download PDF
                </Button>
              </div>
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
