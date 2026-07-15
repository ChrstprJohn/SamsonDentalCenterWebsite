import React from 'react';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/shared/database/server';
import { getAppointmentIdByChatTokenQuery } from '@/modules/appointments/repositories/chat/chat.queries';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ManagePage({ searchParams }: PageProps) {
    const { token } = await searchParams;

    if (token) {
        try {
            const systemDb = await createAdminClient();
            const getApptId = getAppointmentIdByChatTokenQuery(systemDb);
            const appointmentId = await getApptId(token);

            if (appointmentId) {
                redirect(`/appointments/chat/${appointmentId}?token=${token}`);
            }
        } catch (err) {
            console.error('Error handling manage redirection:', err);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500">
                🔒
            </div>
            <div className="flex flex-col gap-2 max-w-md">
                <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                <p className="text-sm text-slate-400 leading-relaxed">
                    The appointment link is invalid or expired. If you believe this is an error, please check the link in your email or contact the clinic.
                </p>
            </div>
            <Link href="/">
                <Button variant="secondary">Go to Home Page</Button>
            </Link>
        </div>
    );
}
