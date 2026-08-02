import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { MessageResponseDto, messageResponseSchema } from '../../dtos/chat/message-response.dto';
import type { GetChatThreadsPageDto } from '../../dtos/chat/get-chat-threads-page.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

export interface ChatThreadDto {
    appointmentId: string;
    patientId?: string | null;
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
    // Notification tracking fields
    confirmationChannel?: string | null;
    emailConfirmationSent?: boolean;
    smsConfirmationSent?: boolean;
    reminder48hSent?: boolean;
    emailReminder48hSent?: boolean;
    smsReminder48hSent?: boolean;
    reminder24hSent?: boolean;
    emailReminder24hSent?: boolean;
    smsReminder24hSent?: boolean;
}

function mapChatThreadRow(row: any): ChatThreadDto {
    let patientName = 'Unknown Patient';
    let patientEmail = '';
    let patientPhone = '';
    let patientFirstName = '';
    let patientMiddleName = '';
    let patientLastName = '';
    let patientSuffix = '';

    if (row.guest_first_name) {
        patientName = `${row.guest_first_name} ${row.guest_last_name}`;
        patientFirstName = row.guest_first_name || '';
        patientMiddleName = row.guest_middle_name || '';
        patientLastName = row.guest_last_name || '';
        patientSuffix = row.guest_suffix || '';
        patientEmail = row.guest_email || '';
        patientPhone = row.guest_phone || '';
    }

    return {
        appointmentId: row.appointment_id,
        patientId: row.patient_id ?? null,
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
        serviceName: row.service_name || 'General Inquiry',
        doctorName: row.doctor_first_name ? `Dr. ${row.doctor_first_name} ${row.doctor_last_name}` : 'Unassigned',
        latestMessage: row.latest_message_text
            ? { text: row.latest_message_text, createdAt: row.latest_message_created_at, senderRole: row.latest_message_sender_role }
            : null,
        unreadCount: Number(row.unread_count),
        confirmationChannel: row.confirmation_channel || 'EMAIL',
        emailConfirmationSent: Boolean(row.email_confirmation_sent),
        smsConfirmationSent: Boolean(row.sms_confirmation_sent),
        emailReminder48hSent: Boolean(row.email_reminder_48h_sent),
        smsReminder48hSent: Boolean(row.sms_reminder_48h_sent),
        emailReminder24hSent: Boolean(row.email_reminder_24h_sent),
        smsReminder24hSent: Boolean(row.sms_reminder_24h_sent),
    };
}

export const getMessagesByAppointmentIdQuery = (supabase: SupabaseClient) => {
    return async (
        appointmentId: string,
        options?: { limit?: number; beforeCreatedAt?: string }
    ): Promise<{ messages: MessageResponseDto[]; hasMore: boolean }> => {
        const limit = options?.limit ?? 25;

        let query = supabase
            .from('appointment_messages')
            .select('id, appointment_id, sender_role, sender_name, message, created_at, is_read')
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

export const getChatThreadsForSecretaryQuery = (supabase: SupabaseClient) => {
    return async (options?: { limit?: number; offset?: number }): Promise<{ data: ChatThreadDto[]; hasMore: boolean }> => {
        const fetchLimit = (options?.limit ?? 20) + 1;
        const { data, error } = await supabase.rpc('get_secretary_chat_threads', {
            p_max_age_days: 90,
            p_max_rows: fetchLimit,
            p_offset: options?.offset ?? 0,
        });

        if (error) {
            throw new DomainError(
                `Failed to fetch chat threads: ${error.message}`,
                'DATABASE_ERROR'
            );
        }

        const rows = (data || []) as any[];
        const hasMore = rows.length > (options?.limit ?? 20);
        const page = rows.slice(0, options?.limit ?? 20);

        const mapped = page.map(mapChatThreadRow);

        return { data: mapped, hasMore };
    };
};

export const getChatThreadsPageQuery = (supabase: SupabaseClient) => {
    return async (params: GetChatThreadsPageDto): Promise<PageResult<ChatThreadDto>> => {
        const cursor = decodeCursor(params.cursor);
        if (params.cursor && !cursor) throw new DomainError('Invalid chat threads cursor.', 'VALIDATION_ERROR');
        const { data, error } = await supabase.rpc('get_secretary_chat_threads_page_staff', {
            p_limit: params.limit ?? 20,
            p_cursor_latest_message_created_at: cursor?.sortValue ?? null,
            p_cursor_appointment_id: cursor?.id ?? null,
            p_tab: params.tab ?? 'ACTIVE',
            p_search: params.search || null,
            p_unread_only: params.unreadOnly ?? false,
        });
        if (error) throw new DomainError(`Failed to fetch chat threads: ${error.message}`, 'DATABASE_ERROR');

        const rows = (data || []) as any[];
        const limit = params.limit ?? 20;
        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;
        const items = page.map(mapChatThreadRow);
        const last = page.at(-1);
        return {
            items,
            nextCursor: hasMore && last
                ? encodeCursor({ sortValue: String(last.sort_created_at), id: String(last.appointment_id) })
                : null,
            hasMore,
            total: page.length > 0 ? Number(page[0].total_count || 0) : 0,
        };
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
        if (data.patient && data.patient.length > 0) {
            const p = data.patient[0];
            patientName = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Guest';
        } else if (data.guest_contacts && data.guest_contacts.length > 0) {
            const gc = data.guest_contacts[0];
            patientName = `${gc.first_name ?? ''} ${gc.last_name ?? ''}`.trim() || 'Guest';
        }

        let doctorName = 'Unassigned';
        if (data.doctor && data.doctor.length > 0) {
            const d = data.doctor[0];
            doctorName = `Dr. ${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || 'Unassigned';
        }

        const s = Array.isArray(data.service) ? data.service[0] : (data.service as any);
        return {
            appointmentId: data.id,
            status: data.status,
            date: data.date,
            preferredStartTime: data.preferred_start_time,
            startTime: data.start_time,
            endTime: data.end_time,
            patientName,
            serviceName: s?.name || 'General Inquiry',
            serviceId: s?.id || null,
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

