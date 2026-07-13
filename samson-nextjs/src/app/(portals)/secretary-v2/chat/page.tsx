import React from 'react';
import { getChatThreadsAction } from '@/modules/appointments/actions/chat/get-chat-threads.action';
import { SecretaryChatInboxView } from '@/modules/staff/views/secretary/secretary-chat-inbox-view';

export const dynamic = 'force-dynamic';

export default async function SecretaryChatInboxPage() {
    const result = await getChatThreadsAction();
    const initialThreads = result?.data || [];

    return (
        <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-100">Patient Chat Inbox</h1>
                <p className="text-xs text-slate-400">Direct, real-time messaging with patient appointments.</p>
            </div>
            <SecretaryChatInboxView initialThreads={initialThreads} />
        </div>
    );
}
