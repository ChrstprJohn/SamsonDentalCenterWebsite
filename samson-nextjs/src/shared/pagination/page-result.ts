export type PageResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
};

export type CursorPayload = {
  version: 1;
  sortValue: string;
  id: string;
};

export function sliceCursorPage<T>(rows: T[], limit: number): { items: T[]; hasMore: boolean } {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
  return rows.length > safeLimit
    ? { items: rows.slice(0, safeLimit), hasMore: true }
    : { items: rows, hasMore: false };
}

export function encodeCursor(payload: Omit<CursorPayload, 'version'>): string {
  return Buffer.from(JSON.stringify({ version: 1, ...payload }), 'utf8').toString('base64url');
}

export function decodeCursor(cursor?: string | null): CursorPayload | null {
  if (!cursor) return null;

  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as Partial<CursorPayload>;
    if (decoded.version !== 1 || typeof decoded.sortValue !== 'string' || typeof decoded.id !== 'string') {
      return null;
    }
    return decoded as CursorPayload;
  } catch {
    return null;
  }
}
