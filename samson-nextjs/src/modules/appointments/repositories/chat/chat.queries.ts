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
    patientPhone?: string | null;
    patientFirstName?: string | null;
    patientMiddleName?: string | null;
    patientLastName?: string | null;
    patientSuffix?: string | null;
    serviceName: string;
    serviceId?: string | null;
    doctorId?: string | null;
    doctorName?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    latestMessage: {
        text: string;
        createdAt: string;
        senderRole: 'PATIENT' | 'STAFF';
    } | null;
    unreadCount: number;
}

export const getMessagesByAppointmentIdQuery = (supabase: SupabaseClient) => {
    return async (
        appointmentId: string,
        options?: { limit?: number; beforeCreatedAt?: string }
    ): Promise<{ messages: MessageResponseDto[]; hasMore: boolean }> => {
        const limit = options?.limit ?? 25;

        let query = supabase
            .from('appointment_messages')
            .select('*')
            .eq('appointment_id', appointmentId);

        if (options?.beforeCreatedAt) {
            query = query.lt('created_at', options.beforeCreatedAt);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })
            .limit(limit + 1);

        if (error) {
            throw new DomainError(
                `Failed to fetch messages: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        const hasMore = (data || []).length > limit;
        const messages = (data || []).slice(0, limit).reverse();

        return {
            messages: messages.map((row) => messageResponseSchema.parse(row)),
            hasMore,
        };
    };
};

const NINETY_DAYS_AGO = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const getChatThreadsForSecretaryQuery = (supabase: SupabaseClient) => {
    return async (): Promise<ChatThreadDto[]> => {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                id,
                status,
                date,
                preferred_start_time,
                start_time,
                end_time,
                service_id,
                doctor_id,
                chat_token,
                patient:users!appointments_patient_id_fkey (
                    first_name,
                    last_name,
                    middle_name,
                    suffix,
                    email,
                    phone_number
                ),
                doctor:users!appointments_doctor_id_fkey (
                    first_name,
                    last_name
                ),
                guest_contacts (
                    first_name,
                    last_name,
                    middle_name,
                    suffix,
                    email,
                    phone_number
                ),
                service:services (
                    name
                )
            `)
            .is('patient_id', null)
            .gte('date', NINETY_DAYS_AGO)
            .neq('status', 'PENDING')
            .order('date', { ascending: false })
            .limit(100);

        if (error) {
            throw new DomainError(
                `Failed to fetch chat threads: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        const rows = (data || [])
            .filter((row: any) => row.guest_contacts?.length > 0);

        const appointmentIds = rows.map((r: any) => r.id);

        // Single batch query for message data across all filtered appointments
        const messagesByAppointment = new Map<string, any[]>();
        if (appointmentIds.length > 0) {
            const { data: allMessages } = await supabase
                .from('appointment_messages')
                .select('id, appointment_id, message, created_at, sender_role, is_read')
                .in('appointment_id', appointmentIds);
            if (allMessages) {
                for (const msg of allMessages) {
                    const existing = messagesByAppointment.get(msg.appointment_id) || [];
                    existing.push(msg);
                    messagesByAppointment.set(msg.appointment_id, existing);
                }
            }
        }

        return rows.map((row: any) => {
            const messages = messagesByAppointment.get(row.id) || [];

            const unreadCount = messages.filter((m: any) => m.sender_role === 'PATIENT' && !m.is_read).length;

            const sortedMessages = [...messages].sort(
                (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const latest = sortedMessages[0] || null;

            let patientName = 'Unknown Patient';
            let patientEmail = '';
            let patientPhone = '';
            let patientFirstName = '';
            let patientMiddleName = '';
            let patientLastName = '';
            let patientSuffix = '';

            if (row.patient) {
                patientName = `${row.patient.first_name} ${row.patient.last_name}`;
                patientFirstName = row.patient.first_name || '';
                patientMiddleName = row.patient.middle_name || '';
                patientLastName = row.patient.last_name || '';
                patientSuffix = row.patient.suffix || '';
                patientEmail = row.patient.email || '';
                patientPhone = row.patient.phone_number || '';
            } else if (row.guest_contacts && row.guest_contacts.length > 0) {
                patientName = `${row.guest_contacts[0].first_name} ${row.guest_contacts[0].last_name}`;
                patientFirstName = row.guest_contacts[0].first_name || '';
                patientMiddleName = row.guest_contacts[0].middle_name || '';
                patientLastName = row.guest_contacts[0].last_name || '';
                patientSuffix = row.guest_contacts[0].suffix || '';
                patientEmail = row.guest_contacts[0].email || '';
                patientPhone = row.guest_contacts[0].phone_number || '';
            }

            let doctorName = 'Unassigned';
            if (row.doctor) {
                doctorName = `Dr. ${row.doctor.first_name} ${row.doctor.last_name}`;
            }

            return {
                appointmentId: row.id,
                status: row.status,
                date: row.date,
                preferredStartTime: row.preferred_start_time,
                startTime: row.start_time,
                endTime: row.end_time,
                serviceId: row.service_id,
                doctorId: row.doctor_id,
                chatToken: row.chat_token,
                patientName,
                patientEmail,
                patientPhone,
                patientFirstName,
                patientMiddleName,
                patientLastName,
                patientSuffix,
                serviceName: row.service?.name || 'General Inquiry',
                doctorName,
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
                start_time,
                end_time,
                patient:users!appointments_patient_id_fkey (
                    first_name,
                    last_name
                ),
                doctor:users!appointments_doctor_id_fkey (
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

        let doctorName = 'Unassigned';
        if (data.doctor) {
            doctorName = `Dr. ${data.doctor.first_name} ${data.doctor.last_name}`;
        }

        return {
            appointmentId: data.id,
            status: data.status,
            date: data.date,
            preferredStartTime: data.preferred_start_time,
            startTime: data.start_time,
            endTime: data.end_time,
            patientName,
            serviceName: data.service?.name || 'General Inquiry',
            serviceId: data.service?.id || null,
            doctorName,
        };
    };
};

export const getAppointmentIdByChatTokenQuery = (supabase: SupabaseClient) => {
    return async (token: string): Promise<string | null> => {
        const { data, error } = await supabase
            .from('appointments')
            .select('id')
            .eq('chat_token', token)
            .maybeSingle();

        if (error) {
            throw new DomainError(
                `Failed to query appointment by token: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        return data ? data.id : null;
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

