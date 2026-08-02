'use server';

import { z } from 'zod';
import { createClient, createAdminClient } from '@/shared/database/server';
import { getChatThreadsPageSchema, type GetChatThreadsPageDto } from '../../dtos/chat/get-chat-threads-page.dto';
import { getChatThreadsPageQuery } from '../../repositories/chat/chat.queries';

export async function getChatThreadsPageAction(params: GetChatThreadsPageDto, options?: { skipAuth?: boolean }) {
    try {
        let supabase;
        if (options?.skipAuth) {
            supabase = await createAdminClient();
        } else {
            supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { success: false as const, error: 'Unauthorized user session' };
            const role = user.user_metadata?.role as string;
            if (role !== 'SECRETARY' && role !== 'ADMIN') return { success: false as const, error: 'Unauthorized role' };
        }
        const validated = getChatThreadsPageSchema.parse(params);
        const result = await getChatThreadsPageQuery(supabase)(validated);
        return { success: true as const, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
        return { success: false as const, error: error instanceof Error ? error.message : 'Failed to retrieve chat threads' };
    }
}
