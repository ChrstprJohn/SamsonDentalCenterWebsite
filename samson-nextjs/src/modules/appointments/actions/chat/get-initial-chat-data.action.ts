"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { getTrustedUserProfile } from '@/shared/auth/auth.util';
import { validateChatTokenQuery, getMessagesByAppointmentIdQuery } from '../../repositories/chat/chat.queries';

interface InitialDataResult {
    appointmentDetails: {
        status: string;
        date: string;
        preferredStartTime: string | null;
        patientName: string;
        serviceName: string;
        serviceId: string | null;
    };
    initialMessages: any[];
    initialHasMore: boolean;
    currentUserRole: 'PATIENT' | 'STAFF';
    currentUserName: string;
}

export async function getChatInitialDataAction(
    appointmentId: string,
    chatToken?: string
): Promise<{ data: InitialDataResult } | { error: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const profile = await getTrustedUserProfile(user.id);
            const role = profile.role;
            const userId = user.id;
            const systemDb = await createAdminClient();

            const [appt, messagesResult] = await Promise.all([
                systemDb
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
                            id,
                            name
                        )
                    `)
                    .eq('id', appointmentId)
                    .maybeSingle(),
                getMessagesByAppointmentIdQuery(systemDb)(appointmentId),
            ]);

            if (appt) {
                const isStaff = ['SECRETARY', 'ADMIN', 'DOCTOR'].includes(role);
                const isOwner = appt.patient_id === userId;

                if (isStaff || isOwner) {
                    const currentUserRole = isStaff ? 'STAFF' : 'PATIENT';

                    let patientName = 'Patient';
                    if (appt.patient) {
                        patientName = `${appt.patient.first_name} ${appt.patient.last_name}`;
                    } else if (appt.guest_contacts && appt.guest_contacts.length > 0) {
                        patientName = `${appt.guest_contacts[0].first_name} ${appt.guest_contacts[0].last_name}`;
                    }

                    return {
                        data: {
                            appointmentDetails: {
                                status: appt.status,
                                date: appt.date,
                                preferredStartTime: appt.preferred_start_time,
                                patientName,
                                serviceName: appt.service?.name || 'General Inquiry',
                                serviceId: appt.service?.id || null,
                            },
                            initialMessages: messagesResult?.messages || [],
                            initialHasMore: messagesResult?.hasMore ?? false,
                            currentUserRole,
                            currentUserName: isStaff
                                ? `${profile.firstName} ${profile.lastName}`.trim()
                                : `${profile.firstName} ${profile.lastName}`.trim(),
                        }
                    };
                }
            }
        }

        if (chatToken) {
            const systemDb = await createAdminClient();

            const [appt, messagesResult] = await Promise.all([
                validateChatTokenQuery(systemDb)(appointmentId, chatToken),
                getMessagesByAppointmentIdQuery(systemDb)(appointmentId),
            ]);

            if (appt) {
                return {
                    data: {
                        appointmentDetails: appt,
                        initialMessages: messagesResult?.messages || [],
                        initialHasMore: messagesResult?.hasMore ?? false,
                        currentUserRole: 'PATIENT',
                        currentUserName: appt.patientName,
                    }
                };
            }
        }

        return { error: 'Access denied' };
    } catch (err: any) {
        console.error('Error fetching chat initial data:', err);
        return { error: err.message || 'Failed to load chat data' };
    }
}
