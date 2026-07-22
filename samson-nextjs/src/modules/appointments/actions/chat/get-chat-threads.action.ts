"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { getChatThreadsForSecretaryQuery } from '../../repositories/chat/chat.queries';

export async function getChatThreadsAction(options?: { limit?: number; offset?: number; skipAuth?: boolean }) {
    try {
        let supabase;
        if (options?.skipAuth) {
            supabase = await createAdminClient();
        } else {
            supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { error: 'Unauthorized user session' };
            }
            const role = user.user_metadata?.role as string;
            if (role !== 'SECRETARY' && role !== 'ADMIN') {
                return { error: 'Unauthorized role' };
            }
        }

        const query = getChatThreadsForSecretaryQuery(supabase);
        const result = await query(options);
        return { data: result.data, hasMore: result.hasMore };
    } catch (error: any) {
        return { error: error.message || 'Failed to retrieve chat threads' };
    }
}

