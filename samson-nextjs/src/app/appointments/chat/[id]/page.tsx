import React from 'react';
import { createClient, createAdminClient } from '@/shared/database/server';
import { validateChatTokenQuery } from '@/modules/appointments/repositories/chat/chat.queries';
import { getMessagesAction } from '@/modules/appointments/actions/chat/get-messages.action';
import { PatientChatView } from '@/modules/appointments/views/chat/patient-chat-view';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
}

export default async function SecureChatPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { token } = await searchParams;

    let supabase;
    let currentUserRole: 'PATIENT' | 'STAFF' = 'PATIENT';
    let currentUserName = 'Patient';
    let hasAccess = false;
    let appointmentDetails: any = null;

    try {
        supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const role = user.user_metadata?.role as string;
            const userId = user.id;

            const systemDb = await createAdminClient();
            const { data: appt } = await systemDb
                .from('appointments')
                .select(`
                    id,
                    status,
                    date,
                    preferred_start_time,
                    patient_id,
                    patient:users!appointments_patient_id_fkey (
                        first_name,
                        last_name
                    ),
                    guest_contacts (
                        first_name,
                        last_name
                    ),
                    service:services (
                        name
                    )
                `)
                .eq('id', id)
                .maybeSingle();

            if (appt) {
                const isStaff = ['SECRETARY', 'ADMIN', 'DOCTOR'].includes(role);
                const isOwner = appt.patient_id === userId;

                if (isStaff || isOwner) {
                    hasAccess = true;
                    currentUserRole = isStaff ? 'STAFF' : 'PATIENT';

                    let patientName = 'Patient';
                    if (appt.patient) {
                        patientName = `${appt.patient.first_name} ${appt.patient.last_name}`;
                    } else if (appt.guest_contacts && appt.guest_contacts.length > 0) {
                        patientName = `${appt.guest_contacts[0].first_name} ${appt.guest_contacts[0].last_name}`;
                    }

                    appointmentDetails = {
                        status: appt.status,
                        date: appt.date,
                        preferredStartTime: appt.preferred_start_time,
                        patientName,
                        serviceName: appt.service?.name || 'General Inquiry',
                    };
                    currentUserName = isStaff
                        ? 'Secretary'
                        : (user.user_metadata?.first_name || 'Patient');
                }
            }
        }

        if (!hasAccess && token) {
            const systemDb = await createAdminClient();
            const validateToken = validateChatTokenQuery(systemDb);
            const appt = await validateToken(id, token);

            if (appt) {
                hasAccess = true;
                currentUserRole = 'PATIENT';
                currentUserName = appt.patientName;
                appointmentDetails = appt;
            }
        }
    } catch (err) {
        console.error('Error validating secure chat access:', err);
    }

    if (!hasAccess) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-950 items-center justify-center p-6 text-center gap-6">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500">
                    🔒
                </div>
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

    const res = await getMessagesAction(id, token);
    const initialMessages = res?.data || [];

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
            <PatientChatView
                appointmentId={id}
                appointmentDetails={appointmentDetails}
                initialMessages={initialMessages}
                currentUserRole={currentUserRole}
                currentUserName={currentUserName}
                chatToken={token}
            />
        </div>
    );
}
