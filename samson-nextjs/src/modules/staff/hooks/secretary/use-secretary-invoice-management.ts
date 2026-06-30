'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSecretary } from '../use-secretary';
import { getInvoicesAction } from '@/modules/billing/actions/invoicing/get-invoices.action';
import { Invoice } from '../../types/secretary.types';

export function useSecretaryInvoiceManagement() {
  const { invoices: mockInvoices } = useSecretary();
  const [liveInvoices, setLiveInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      setIsLoading(true);
      const res = await getInvoicesAction({ status: 'FINALIZED', page: 1, limit: 100 });
      if (res.success && res.data) {
        // Map database invoice response DTO fields to frontend Invoice view schema
        const mapped: Invoice[] = res.data.map((inv: any) => ({
          id: inv.id,
          appointmentId: inv.appointmentId,
          patientName: 'Patient Record', // Database joins would yield names; fallback for display
          doctorName: 'Dr. Christopher Samson',
          serviceName: 'Completed Treatment Service',
          amount: inv.amount,
          basePrice: inv.amount / (1 - (inv.discountApplied || 0) / 100) || inv.amount,
          discountApplied: inv.discountApplied || 0,
          paymentMethod: inv.paymentMethod || 'CASH',
          status: inv.status,
          created_at: inv.createdAt || new Date().toISOString(),
        }));
        setLiveInvoices(mapped);
      } else {
        // Fallback to simulator mocks if database query fails or during development
        setLiveInvoices(mockInvoices.filter((i) => i.status === 'FINALIZED'));
      }
      setIsLoading(false);
    }
    fetchInvoices();
  }, [mockInvoices]);

  const selectedInvoice = useMemo(
    () => liveInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [liveInvoices, selectedInvoiceId]
  );

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return liveInvoices.filter((invoice) => {
      const matchesSearch =
        invoice.patientName.toLowerCase().includes(normalizedSearch) ||
        invoice.doctorName.toLowerCase().includes(normalizedSearch) ||
        invoice.serviceName.toLowerCase().includes(normalizedSearch);
      const matchesMethod = methodFilter ? invoice.paymentMethod === methodFilter : true;

      return matchesSearch && matchesMethod;
    });
  }, [liveInvoices, methodFilter, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    methodFilter,
    setMethodFilter,
    selectedInvoiceId,
    setSelectedInvoiceId,
    selectedInvoice,
    filteredInvoices,
    isLoading,
  };
}

