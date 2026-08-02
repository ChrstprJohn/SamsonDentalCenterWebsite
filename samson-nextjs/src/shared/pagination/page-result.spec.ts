import { describe, expect, it } from 'vitest';
import { decodeCursor, encodeCursor, sliceCursorPage } from './page-result';

describe('cursor page contract', () => {
  it.each([0, 1, 3, 20, 21, 40, 41])('handles %i fetched rows at a 20-row page size', (rowCount) => {
    const rows = Array.from({ length: rowCount }, (_, index) => index);
    const page = sliceCursorPage(rows, 20);
    expect(page.items).toEqual(rows.slice(0, Math.min(rowCount, 20)));
    expect(page.hasMore).toBe(rowCount > 20);
  });

  it('round-trips a stable sort/id cursor', () => {
    const cursor = encodeCursor({ sortValue: '2026-08-02T10:00:00.000Z', id: 'row-20' });
    expect(decodeCursor(cursor)).toEqual({ version: 1, sortValue: '2026-08-02T10:00:00.000Z', id: 'row-20' });
  });

  it('rejects malformed and incompatible cursors', () => {
    expect(decodeCursor('not-a-cursor')).toBeNull();
    expect(decodeCursor(Buffer.from(JSON.stringify({ version: 2, sortValue: 'x', id: 'y' })).toString('base64url'))).toBeNull();
  });
});
