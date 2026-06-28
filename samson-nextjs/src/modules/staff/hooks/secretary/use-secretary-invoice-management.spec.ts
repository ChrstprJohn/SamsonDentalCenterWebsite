/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Invoice } from '../../types/secretary.types';
import { useSecretaryInvoiceManagement } from './use-secretary-invoice-management';

describe('useSecretaryInvoiceManagement', () => {
  it('keeps invoice filters and selected invoice in the hook', () => {
    const { result } = renderHook(() => useSecretaryInvoiceManagement());
    const firstInvoice = result.current.filteredInvoices[0];

    act(() => {
      result.current.setSearchTerm(firstInvoice.patientName);
      result.current.setSelectedInvoiceId(firstInvoice.id);
    });

    expect(result.current.filteredInvoices.every((invoice: Invoice) => invoice.patientName.includes(firstInvoice.patientName))).toBe(true);
    expect(result.current.selectedInvoice?.id).toBe(firstInvoice.id);
  });
});
