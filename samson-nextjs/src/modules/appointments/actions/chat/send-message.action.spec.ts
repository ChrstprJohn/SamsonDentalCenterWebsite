import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessageAction } from './send-message.action';
import * as serverDb from '@/shared/database/server';

vi.mock('@/shared/database/server', () => ({
    createClient: vi.fn(),
    createAdminClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('SendMessageAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error if unauthorized user attempts call', async () => {
        const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });
        const mockSupabase = { auth: { getUser: mockGetUser } };
        vi.spyOn(serverDb, 'createClient').mockResolvedValue(mockSupabase as any);

        const result = await sendMessageAction({
            appointmentId: 'c2a71d23-28ad-4c81-8178-5e4c622a59a7',
            message: 'Hello',
            senderRole: 'PATIENT',
            senderName: 'John',
        });

        expect(result.error).toBe('Unauthorized user session');
    });
});
