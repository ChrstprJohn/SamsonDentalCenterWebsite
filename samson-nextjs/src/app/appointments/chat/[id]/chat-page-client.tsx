'use client';

import React, { useEffect, useState } from 'react';
import { PatientChatView } from '@/modules/appointments/views/chat/patient-chat-view';
import { getChatInitialDataAction } from '@/modules/appointments/actions/chat/get-initial-chat-data.action';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ChatPageClientProps {
    appointmentId: string;
    chatToken?: string;
}

type LoadState =
    | { status: 'loading' }
    | { status: 'denied' }
    | { status: 'loaded'; data: any };

export function ChatPageClient({ appointmentId, chatToken }: ChatPageClientProps) {
    const [state, setState] = useState<LoadState>({ status: 'loading' });

    useEffect(() => {
        getChatInitialDataAction(appointmentId, chatToken)
            .then((result) => {
                if ('error' in result) {
                    setState({ status: 'denied' });
                } else {
                    setState({ status: 'loaded', data: result.data });
                }
            })
            .catch(() => setState({ status: 'denied' }));
    }, [appointmentId, chatToken]);

    if (state.status === 'loading') {
        return null;
    }

    if (state.status === 'denied') {
        return (
            <div className="flex flex-col min-h-screen bg-slate-950 items-center justify-center p-6 text-center gap-6">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500">🔒</div>
                <div className="flex flex-col gap-2 max-w-md">
                    <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        You do not have a valid secure token or user session authorized to access this private appointment chat thread.
                    </p>
                </div>
                <Link href="/">
                    <Button variant="secondary">Go to Home Page</Button>
                </Link>
            </div>
        );
    }

    return (
        <PatientChatView
            appointmentId={appointmentId}
            appointmentDetails={state.data.appointmentDetails}
            initialMessages={state.data.initialMessages}
            initialHasMore={state.data.initialHasMore}
            currentUserRole={state.data.currentUserRole}
            currentUserName={state.data.currentUserName}
            chatToken={chatToken}
        />
    );
}
