import { beforeEach, expect, it, vi } from 'vitest';
import { updateWellbeingStatusAction } from './update-wellbeing-status.action';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
vi.mock('@/shared/database/server', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/shared/auth/auth.util', () => ({ authorizeRole: vi.fn() }));
const id = '4d91ee34-2adb-456f-a0ac-d86b450868af';
beforeEach(() => vi.clearAllMocks());

it('returns the same update timestamp saved to existing columns', async () => {
  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ update });
  vi.mocked(createAdminClient).mockResolvedValue({ from } as never);
  const result = await updateWellbeingStatusAction({ id, status: 'COMPLETED' });
  expect(authorizeRole).toHaveBeenCalledWith('SECRETARY');
  expect(from).toHaveBeenCalledWith('checkout_follow_up_responses');
  expect(result.success).toBe(true);
  if (result.success) expect(update).toHaveBeenCalledWith({ status: 'COMPLETED', updated_at: result.data.updatedAt });
  expect(eq).toHaveBeenCalledWith('id', id);
});

it('keeps database failures as failures', async () => {
  vi.mocked(createAdminClient).mockResolvedValue({ from: () => ({ update: () => ({ eq: async () => ({ error: { message: 'Unable to save' } }) }) }) } as never);
  expect(await updateWellbeingStatusAction({ id, status: 'COMPLETED' })).toEqual({ success: false, error: 'Failed to update status: Unable to save' });
});
