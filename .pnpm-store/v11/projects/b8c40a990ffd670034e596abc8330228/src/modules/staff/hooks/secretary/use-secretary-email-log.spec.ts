/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { EmailLog } from '../../types/secretary.types';
import { useSecretaryEmailLog } from './use-secretary-email-log';

describe('useSecretaryEmailLog', () => {
  it('filters email logs and exposes selected email details', () => {
    const { result } = renderHook(() => useSecretaryEmailLog());
    const firstEmail = result.current.filteredEmails[0];

    act(() => result.current.setSearchTerm(firstEmail.recipient));
    expect(result.current.filteredEmails.every((email: EmailLog) => email.recipient.includes(firstEmail.recipient))).toBe(true);

    act(() => result.current.setSelectedEmailId(firstEmail.id));
    expect(result.current.selectedEmail?.id).toBe(firstEmail.id);
  });
});
