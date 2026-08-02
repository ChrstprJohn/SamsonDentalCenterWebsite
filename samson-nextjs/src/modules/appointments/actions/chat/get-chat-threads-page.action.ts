'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getChatThreadsPageSchema, type GetChatThreadsPageDto } from '../../dtos/chat/get-chat-threads-page.dto';
import { getChatThreadsPageQuery } from '../../repositories/chat/chat.queries';

export async function getChatThreadsPageAction(params: GetChatThreadsPageDto) {
    try {
        await authorizeRole('SECRETARY');
        const supabase = await createClient();
        const validated = getChatThreadsPageSchema.parse(params);
        const result = await getChatThreadsPageQuery(supabase)(validated);
        return { success: true as const, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
        return { success: false as const, error: error instanceof Error ? error.message : 'Failed to retrieve chat threads' };
    }
}
