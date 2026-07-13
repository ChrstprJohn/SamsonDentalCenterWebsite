'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/shared/database/client';
import { MessageResponseDto } from '../../dtos/chat/message-response.dto';
import { sendMessageAction } from '../../actions/chat/send-message.action';
import { markMessagesAsReadAction } from '../../actions/chat/mark-read.action';

interface UseChatMessagesProps {
    appointmentId: string;
    initialMessages: MessageResponseDto[];
    currentUserRole: 'PATIENT' | 'STAFF';
    currentUserName: string;
    chatToken?: string;
}

export function useChatMessages({
    appointmentId,
    initialMessages,
    currentUserRole,
    currentUserName,
    chatToken,
}: UseChatMessagesProps) {
    const [messages, setMessages] = useState<MessageResponseDto[]>(initialMessages);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // Scroll on message list change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle real-time database listener
    useEffect(() => {
        const supabase = createClient();
        const channelName = `chat_room_${appointmentId}`;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'appointment_messages',
                    filter: `appointment_id=eq.${appointmentId}`,
                },
                (payload: any) => {
                    const newMsg = payload.new;
                    const mapped: MessageResponseDto = {
                        id: newMsg.id,
                        appointmentId: newMsg.appointment_id,
                        senderRole: newMsg.sender_role,
                        senderName: newMsg.sender_name,
                        message: newMsg.message,
                        createdAt: newMsg.created_at,
                        isRead: newMsg.is_read,
                    };

                    setMessages((prev) => {
                        if (prev.some((m) => m.id === mapped.id)) return prev;
                        return [...prev, mapped];
                    });

                    // Mark as read if receiving message from opposite role
                    if (newMsg.sender_role !== currentUserRole) {
                        markMessagesAsReadAction(appointmentId, currentUserRole, chatToken).catch(console.error);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'appointment_messages',
                    filter: `appointment_id=eq.${appointmentId}`,
                },
                (payload: any) => {
                    const updated = payload.new;
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === updated.id
                                ? { ...m, isRead: updated.is_read }
                                : m
                        )
                    );
                }
            )
            .subscribe();

        // Initial mark as read when chat is opened
        markMessagesAsReadAction(appointmentId, currentUserRole, chatToken).catch(console.error);

        return () => {
            supabase.removeChannel(channel);
        };
    }, [appointmentId, currentUserRole, chatToken]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

            setIsSending(true);
            setSendError(null);

            try {
                const result = await sendMessageAction(
                    {
                        appointmentId,
                        message: text.trim(),
                        senderRole: currentUserRole,
                        senderName: currentUserName,
                    },
                    chatToken
                );

                if (result.error) {
                    setSendError(result.error);
                }
            } catch (err: any) {
                setSendError(err.message || 'Failed to send message');
            } finally {
                setIsSending(false);
            }
        },
        [appointmentId, currentUserRole, currentUserName, chatToken]
    );

    return {
        messages,
        sendMessage,
        isSending,
        sendError,
        messagesEndRef,
        scrollToBottom,
    };
}
