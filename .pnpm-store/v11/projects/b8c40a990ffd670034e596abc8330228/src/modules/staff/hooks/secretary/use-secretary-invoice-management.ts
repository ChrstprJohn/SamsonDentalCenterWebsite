'use client';

import { useMemo, useState } from 'react';
import { useSecretary } from '../use-secretary';

export function useSecretaryInvoiceManagement() {
  const { invoices } = useSecretary();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const finalizedInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.status === 'FINALIZED'),
    [invoices]
  );

  const selectedInvoice = useMemo(
    () => finalizedInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [finalizedInvoices, selectedInvoiceId]
  );

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return finalizedInvoices.filter((invoice) => {
      const matchesSearch =
        invoice.patientName.toLowerCase().includes(normalizedSearch) ||
        invoice.doctorName.toLowerCase().includes(normalizedSearch) ||
        invoice.serviceName.toLowerCase().includes(normalizedSearch);
      const matchesMethod = methodFilter ? invoice.paymentMethod === methodFilter : true;

      return matchesSearch && matchesMethod;
    });
  }, [finalizedInvoices, methodFilter, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    methodFilter,
    setMethodFilter,
    selectedInvoiceId,
    setSelectedInvoiceId,
    selectedInvoice,
    filteredInvoices,
  };
}
