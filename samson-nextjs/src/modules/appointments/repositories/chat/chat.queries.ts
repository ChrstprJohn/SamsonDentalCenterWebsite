import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { MessageResponseDto, messageResponseSchema } from '../../dtos/chat/message-response.dto';

export interface ChatThreadDto {
    appointmentId: string;
    status: string;
    date: string;
    preferredStartTime: string | null;
    chatToken: string | null;
    patientName: string;
    patientEmail: string;
    serviceName: string;
    latestMessage: {
        text: string;
        createdAt: string;
        senderRole: 'PATIENT' | 'STAFF';
    } | null;
    unreadCount: number;
}

export const getMessagesByAppointmentIdQuery = (supabase: SupabaseClient) => {
    return async (appointmentId: string): Promise<MessageResponseDto[]> => {
        const { data, error } = await supabase
            .from('appointment_messages')
            .select('*')
            .eq('appointment_id', appointmentId)
            .order('created_at', { ascending: true });

        if (error) {
            throw new DomainError(
                `Failed to fetch messages: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        return (data || []).map((row) => messageResponseSchema.parse(row));
    };
};

export const getChatThreadsForSecretaryQuery = (supabase: SupabaseClient) => {
    return async (): Promise<ChatThreadDto[]> => {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                status,
                date,
                preferred_start_time,
                chat_token,
                patient:users!appointments_patient_id_fkey (
                    first_name,
                    last_name,
                    email
                ),
                guest_contacts (
                    first_name,
                    last_name,
                    email
                ),
                service:services (
                    name
                ),
                appointment_messages (
                    id,
                    message,
                    created_at,
                    sender_role,
                    is_read
                )
            `);

        if (error) {
            throw new DomainError(
                `Failed to fetch chat threads: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        return (data || []).map((row: any) => {
            const messages = row.appointment_messages || [];
            
            // Unread count is patient messages that staff hasn't read
            const unreadCount = messages.filter((m: any) => m.sender_role === 'PATIENT' && !m.is_read).length;

            // Latest message sorting by created_at DESC
            const sortedMessages = [...messages].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const latest = sortedMessages[0] || null;

            let patientName = 'Unknown Patient';
            let patientEmail = '';

            if (row.patient) {
                patientName = `${row.patient.first_name} ${row.patient.last_name}`;
                patientEmail = row.patient.email || '';
            } else if (row.guest_contacts && row.guest_contacts.length > 0) {
                const gc = row.guest_contacts[0];
                patientName = `${gc.first_name} ${gc.last_name} (Guest)`;
                patientEmail = gc.email || '';
            }

            return {
                appointmentId: row.id,
                status: row.status,
                date: row.date,
                preferredStartTime: row.preferred_start_time,
                chatToken: row.chat_token,
                patientName,
                patientEmail,
                serviceName: row.service?.name || 'General Inquiry',
                latestMessage: latest
                    ? {
                          text: latest.message,
                          createdAt: latest.created_at,
                          senderRole: latest.sender_role,
                      }
                    : null,
                unreadCount,
            };
        });
    };
};

export const validateChatTokenQuery = (supabase: SupabaseClient) => {
    return async (appointmentId: string, token: string): Promise<any | null> => {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                status,
                date,
                preferred_start_time,
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
            .eq('id', appointmentId)
            .eq('chat_token', token)
            .maybeSingle();

        if (error) {
            throw new DomainError(
                `Token validation error: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        if (!data) return null;

        let patientName = 'Guest';
        if (data.patient) {
            patientName = `${data.patient.first_name} ${data.patient.last_name}`;
        } else if (data.guest_contacts && data.guest_contacts.length > 0) {
            const gc = data.guest_contacts[0];
            patientName = `${gc.first_name} ${gc.last_name}`;
        }

        return {
            appointmentId: data.id,
            status: data.status,
            date: data.date,
            preferredStartTime: data.preferred_start_time,
            patientName,
            serviceName: data.service?.name || 'General Inquiry',
        };
    };
};

export const getAppointmentStatusQuery = (supabase: SupabaseClient) => {
    return async (appointmentId: string): Promise<{ status: string; patientId: string | null } | null> => {
        const { data, error } = await supabase
            .from('appointments')
            .select('status, patient_id')
            .eq('id', appointmentId)
            .maybeSingle();

        if (error) {
            throw new DomainError(
                `Failed to fetch appointment status: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        if (!data) return null;
        return {
            status: data.status,
            patientId: data.patient_id,
        };
    };
};

