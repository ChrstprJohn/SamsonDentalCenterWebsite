/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AuditLog } from '../../types/secretary.types';
import { useSecretaryAuditLog } from './use-secretary-audit-log';

describe('useSecretaryAuditLog', () => {
  it('filters audit rows by search term and action', () => {
    const { result } = renderHook(() => useSecretaryAuditLog());

    act(() => result.current.setSearchTerm('Secretary'));
    expect(result.current.filteredAudits.length).toBeGreaterThan(0);

    act(() => result.current.setActionFilter(result.current.filteredAudits[0].action));
    expect(result.current.filteredAudits.every((audit: AuditLog) => audit.action === result.current.actionFilter)).toBe(true);
  });
});
