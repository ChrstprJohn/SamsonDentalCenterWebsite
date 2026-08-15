import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitReviewAction } from './submit-review.action';

const mocks = vi.hoisted(() => {
  const insert = vi.fn().mockReturnValue({ error: null });
  const maybeSingle = vi
    .fn()
    .mockResolvedValueOnce({ data: { id: 'apt-1' }, error: null }) // appointment lookup
    .mockResolvedValue({ data: null, error: null }); // existing-review lookup
  const select = vi.fn();
  const chain = {
    from: vi.fn(() => ({
      select: select.mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle,
      insert,
    })),
  };
  return { insert, select, maybeSingle, chain };
});

vi.mock('@/shared/database/server', () => ({
  createAdminClient: vi.fn().mockResolvedValue(mocks.chain),
}));

describe('submitReviewAction (Unit Test)', () => {
  beforeEach(() => {
    mocks.insert.mockClear();
    mocks.maybeSingle
      .mockReset()
      .mockResolvedValueOnce({ data: { id: 'apt-1' }, error: null }) // appointment lookup
      .mockResolvedValue({ data: null, error: null }); // existing-review lookup
  });

  it('stores rating and comment for a valid appointment', async () => {
    const result = await submitReviewAction({ appointmentId: 'apt-1', rating: 5, comment: 'Great visit' });

    expect(result.success).toBe(true);
    expect(mocks.insert).toHaveBeenCalledWith({
      appointment_id: 'apt-1',
      rating: 5,
      comment: 'Great visit',
    });
  });

  it('rejects out-of-range ratings', async () => {
    const result = await submitReviewAction({ appointmentId: 'apt-1', rating: 6 });

    expect(result.success).toBe(false);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('rejects unknown appointment refs', async () => {
    mocks.chain.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: mocks.insert,
    });

    const result = await submitReviewAction({ appointmentId: 'nope', rating: 4 });

    if (result.success) throw new Error('expected failure');
    expect(result.error).toContain('invalid');
  });

  it('rejects a second review for the same appointment', async () => {
    mocks.chain.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'review-1' }, error: null }),
      insert: mocks.insert,
    });

    const result = await submitReviewAction({ appointmentId: 'apt-1', rating: 4 });

    if (result.success) throw new Error('expected failure');
    expect(result.error).toContain('already submitted');
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});