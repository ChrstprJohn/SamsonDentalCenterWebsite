import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getChatThreadsAction } from './get-chat-threads.action';
import * as serverDb from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
    createClient: vi.fn(),
}));

describe('GetChatThreadsAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error if role is not authorized', async () => {
        const mockGetUser = vi.fn().mockResolvedValue({ data: { user: { id: 'patient-id', user_metadata: { role: 'PATIENT' } } } });
        const mockSupabase = { auth: { getUser: mockGetUser } };
        vi.spyOn(serverDb, 'createClient').mockResolvedValue(mockSupabase as any);

        const result = await getChatThreadsAction();

        expect(result.error).toBe('Unauthorized role');
    });
});
