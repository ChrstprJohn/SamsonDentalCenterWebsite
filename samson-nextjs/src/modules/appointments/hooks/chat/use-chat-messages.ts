'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/shared/database/client';
import { MessageResponseDto } from '../../dtos/chat/message-response.dto';
import { sendMessageAction } from '../../actions/chat/send-message.action';
import { markMessagesAsReadAction } from '../../actions/chat/mark-read.action';
import { getMessagesAction } from '../../actions/chat/get-messages.action';

const PAGE_SIZE = 20;

interface UseChatMessagesProps {
    appointmentId: string;
    initialMessages: MessageResponseDto[];
    currentUserRole: 'PATIENT' | 'STAFF';
    currentUserName: string;
    chatToken?: string;
    initialHasMore?: boolean;
}

export function useChatMessages({
    appointmentId,
    initialMessages,
    currentUserRole,
    currentUserName,
    chatToken,
    initialHasMore = false,
}: UseChatMessagesProps) {
    const [messages, setMessages] = useState<MessageResponseDto[]>(initialMessages);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loadingMore, setLoadingMore] = useState(false);
    const [scrollKey, setScrollKey] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const prevAppointmentIdRef = useRef(appointmentId);
    const loadedAllRef = useRef(!initialHasMore);
    const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const markReadScheduledRef = useRef(false);

    // Sync initialMessages when they arrive after mount (e.g., parent fetches asynchronously)
    useEffect(() => {
        setMessages(initialMessages);
        setHasMore(initialHasMore);
        setScrollKey((k) => k + 1);
        if (appointmentId !== prevAppointmentIdRef.current) {
            prevAppointmentIdRef.current = appointmentId;
            loadedAllRef.current = !initialHasMore;
        }
    }, [appointmentId, initialMessages, initialHasMore]);

    // Auto-scroll to bottom of chat
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // Scroll to bottom when scrollKey increments (new messages only, not pagination)
    useEffect(() => {
        scrollToBottom();
    }, [scrollKey, scrollToBottom]);

    const loadOlderMessages = useCallback(async () => {
        if (loadingMore || loadedAllRef.current) return;

        setLoadingMore(true);
        try {
            const oldestMsg = messages[0];
            if (!oldestMsg) return;

            const res = await getMessagesAction(appointmentId, chatToken, {
                limit: PAGE_SIZE,
                beforeCreatedAt: oldestMsg.createdAt,
            });

            if (res && res.data && res.data.length > 0) {
                setMessages((prev) => [...res.data!, ...prev]);
                setHasMore(res.hasMore ?? false);
                loadedAllRef.current = !res.hasMore;
            } else {
                setHasMore(false);
                loadedAllRef.current = true;
            }
        } catch (err) {
            console.error('Failed to load older messages:', err);
        } finally {
            setLoadingMore(false);
        }
    }, [appointmentId, chatToken, loadingMore, messages]);

    const scheduleMarkAsRead = useCallback(() => {
        if (markReadScheduledRef.current) return;
        markReadScheduledRef.current = true;
        if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
        markReadTimerRef.current = setTimeout(() => {
            markReadScheduledRef.current = false;
            markReadTimerRef.current = null;
            markMessagesAsReadAction(appointmentId, currentUserRole, chatToken).catch(console.error);
        }, 1500);
    }, [appointmentId, currentUserRole, chatToken]);

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
                    setScrollKey((k) => k + 1);

                    // Debounced mark-as-read when receiving messages from opposite role
                    if (newMsg.sender_role !== currentUserRole) {
                        scheduleMarkAsRead();
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

        // Guest polling: only poll for new messages (latest 5)
        let pollInterval: any = null;
        if (chatToken) {
            pollInterval = setInterval(async () => {
                const res = await getMessagesAction(appointmentId, chatToken, { limit: 5, skipAuth: true });
                if (res && res.data && res.data.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const newMsgs = res.data!.filter((m) => !existingIds.has(m.id));
                        if (newMsgs.length === 0) return prev;
                        return [...prev, ...newMsgs];
                    });
                    setScrollKey((k) => k + 1);
                }
            }, 4000);
        }

        return () => {
            supabase.removeChannel(channel);
            if (pollInterval) {
                clearInterval(pollInterval);
            }
            if (markReadTimerRef.current) {
                clearTimeout(markReadTimerRef.current);
                markReadTimerRef.current = null;
            }
            markReadScheduledRef.current = false;
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
        hasMore,
        loadingMore,
        loadOlderMessages,
    };
}
