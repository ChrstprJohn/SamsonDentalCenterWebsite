import React from 'react';
import { getChatThreadsAction } from '@/modules/appointments/actions/chat/get-chat-threads.action';
import { SecretaryChatInboxView } from '@/modules/staff/views/secretary/secretary-chat-inbox-view';

export const dynamic = 'force-dynamic';

export default async function SecretaryChatInboxPage() {
    const result = await getChatThreadsAction();
    const initialThreads = result?.data || [];

    return <SecretaryChatInboxView initialThreads={initialThreads} />;
}
