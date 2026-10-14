import { expect, it, vi } from 'vitest';
import { SecretaryFollowUpListView } from './secretary-follow-up-list-view';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DEFAULT_FOLLOW_UP_FILTERS } from './sub-components/follow-up-filters';
vi.mock('@/shared/database/server', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/shared/auth/auth.util', () => ({ authorizeRole: vi.fn() }));
vi.mock('./sub-components/follow-up-responses-panel', () => ({ FollowUpResponsesPanel: () => null }));

it('filters database rows before the existing 100-row limit', async () => {
  const queries = new Map<string, Record<string, ReturnType<typeof vi.fn>>>();
  const from = vi.fn((table: string) => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of ['select', 'eq', 'in', 'gte', 'lt', 'order']) query[method] = vi.fn(() => query);
    query.limit = vi.fn(async () => ({ data: [], error: null }));
    queries.set(table, query);
    return query;
  });
  vi.mocked(createAdminClient).mockResolvedValue({ from } as never);
  await SecretaryFollowUpListView({ filters: { ...DEFAULT_FOLLOW_UP_FILTERS, stage: 'COMPLETED', period: 'RANGE', dateField: 'UPDATED', from: '2026-08-20', to: '2026-08-21' } });
  expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
  const query = queries.get('checkout_follow_up_responses')!;
  expect(query.in).toHaveBeenCalledWith('status', ['COMPLETED']);
  expect(query.gte).toHaveBeenCalledWith('updated_at', '2026-08-20T00:00:00+08:00');
  expect(query.lt).toHaveBeenCalledWith('updated_at', '2026-08-22T00:00:00+08:00');
  expect(query.order).toHaveBeenCalledWith('updated_at', { ascending: false });
  expect(query.limit).toHaveBeenCalledWith(100);
  expect(query.lt.mock.invocationCallOrder[0]).toBeLessThan(query.limit.mock.invocationCallOrder[0]);
});
