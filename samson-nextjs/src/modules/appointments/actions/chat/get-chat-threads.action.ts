"use server";

import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getChatThreadsForSecretaryQuery } from '../../repositories/chat/chat.queries';

export async function getChatThreadsAction(options?: { limit?: number; offset?: number }) {
    try {
        await authorizeRole('SECRETARY');
        const supabase = await createAdminClient();

        const query = getChatThreadsForSecretaryQuery(supabase);
        const result = await query(options);
        return { data: result.data, hasMore: result.hasMore };
    } catch (error: any) {
        return { error: error.message || 'Failed to retrieve chat threads' };
    }
}

