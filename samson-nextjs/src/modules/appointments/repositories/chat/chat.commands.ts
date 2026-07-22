import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { SendMessageDto } from '../../dtos/chat/send-message.dto';
import { MessageResponseDto, messageResponseSchema } from '../../dtos/chat/message-response.dto';

export const insertMessageCommand = (supabase: SupabaseClient) => {
    return async (data: SendMessageDto): Promise<MessageResponseDto> => {
        const dbPayload = {
            appointment_id: data.appointmentId,
            sender_role: data.senderRole,
            sender_name: data.senderName,
            message: data.message,
        };

        const { data: result, error } = await supabase
            .from('appointment_messages')
            .insert([dbPayload])
            .select()
            .single();

        if (error || !result) {
            throw new DomainError(
                `Failed to insert message: ${error?.message || 'Unknown error'}`,
                'DATABASE_ERROR'
            );
        }

        return messageResponseSchema.parse(result);
    };
};

export const markMessagesAsReadCommand = (supabase: SupabaseClient) => {
    return async (appointmentId: string, senderRoleToMarkRead: 'PATIENT' | 'STAFF'): Promise<void> => {
        const { error } = await supabase
            .from('appointment_messages')
            .update({ is_read: true })
            .eq('appointment_id', appointmentId)
            .eq('sender_role', senderRoleToMarkRead)
            .eq('is_read', false);

        if (error) {
            throw new DomainError(
                `Failed to mark messages as read: ${error.message}`,
                'DATABASE_ERROR'
            );
        }
    };
};
