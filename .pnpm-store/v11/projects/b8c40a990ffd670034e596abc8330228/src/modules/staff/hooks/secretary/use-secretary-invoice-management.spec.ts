/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Invoice } from '../../types/secretary.types';

vi.mock('@/modules/billing/actions/invoicing/get-invoices.action', () => ({
  getInvoicesAction: vi.fn().mockResolvedValue({
    success: true,
    data: [
      {
        id: 'inv-1',
        appointmentId: 'app-5',
        amount: 1500,
        discountApplied: 0,
        paymentMethod: 'CASH',
        status: 'FINALIZED',
        createdAt: '2026-06-20T09:30:00Z',
      }
    ]
  })
}));

import { useSecretaryInvoiceManagement } from './use-secretary-invoice-management';

describe('useSecretaryInvoiceManagement', () => {
  it('keeps invoice filters and selected invoice in the hook', async () => {
    const { result } = renderHook(() => useSecretaryInvoiceManagement());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const firstInvoice = result.current.filteredInvoices[0];

    act(() => {
      result.current.setSearchTerm(firstInvoice.patientName);
      result.current.setSelectedInvoiceId(firstInvoice.id);
    });

    expect(result.current.filteredInvoices.every((invoice: Invoice) => invoice.patientName.includes(firstInvoice.patientName))).toBe(true);
    expect(result.current.selectedInvoice?.id).toBe(firstInvoice.id);
  });
});
