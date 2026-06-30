/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { EmailLog } from '../../types/secretary.types';

vi.mock('@/modules/emails/actions/logs/get-outbox-logs.action', () => ({
  getOutboxLogsAction: vi.fn().mockResolvedValue({
    success: true,
    data: [
      {
        id: 'eml-1',
        eventType: 'Confirmation',
        payload: { email: 'jane.doe@example.com' },
        status: 'PROCESSED',
        createdAt: '2026-06-22T08:00:00Z',
      }
    ]
  })
}));
vi.mock('@/modules/emails/actions/logs/resend-email.action', () => ({
  resendEmailAction: vi.fn().mockResolvedValue({ success: true })
}));

import { useSecretaryEmailLog } from './use-secretary-email-log';

describe('useSecretaryEmailLog', () => {
  it('filters email logs and exposes selected email details', async () => {
    const { result } = renderHook(() => useSecretaryEmailLog());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const firstEmail = result.current.filteredEmails[0];

    act(() => result.current.setSearchTerm(firstEmail.recipient));
    expect(result.current.filteredEmails.every((email: EmailLog) => email.recipient.includes(firstEmail.recipient))).toBe(true);

    act(() => result.current.setSelectedEmailId(firstEmail.id));
    expect(result.current.selectedEmail?.id).toBe(firstEmail.id);
  });
});
