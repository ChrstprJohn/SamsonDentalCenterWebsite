import React from 'react';
import { ChatPageClient } from './chat-page-client';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
}

export default async function SecureChatPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { token } = await searchParams;

    return (
        <div className="h-screen w-full bg-slate-950 flex justify-center overflow-hidden">
            <ChatPageClient appointmentId={id} chatToken={token} />
        </div>
    );
}
