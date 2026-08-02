import React from 'react';
import { getChatThreadsPageAction } from '@/modules/appointments/actions/chat/get-chat-threads-page.action';
import { SecretaryChatInboxView } from '@/modules/staff/views/secretary/secretary-chat-inbox-view';

export const dynamic = 'force-dynamic';

export default async function SecretaryChatInboxPage() {
    const [result, archiveResult] = await Promise.all([
        getChatThreadsPageAction({ limit: 20, cursor: null, tab: 'ACTIVE', search: undefined, unreadOnly: false }),
        getChatThreadsPageAction({ limit: 1, cursor: null, tab: 'ARCHIVE', search: undefined, unreadOnly: false }),
    ]);
    const initialThreads = result.success && result.data ? result.data.items : [];
    const initialTabCounts = {
        active: result.success && result.data ? result.data.total ?? initialThreads.length : 0,
        archive: archiveResult.success && archiveResult.data ? archiveResult.data.total ?? archiveResult.data.items.length : 0,
    };

    return <SecretaryChatInboxView initialThreads={initialThreads} initialHasMore={result.success ? result.data?.hasMore ?? false : false} initialTabCounts={initialTabCounts} />;
}
