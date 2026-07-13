// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatMessages } from './use-chat-messages';
import * as clientDb from '@/shared/database/client';
import * as sendAction from '../../actions/chat/send-message.action';

vi.mock('@/shared/database/client', () => ({
    createClient: vi.fn(),
}));

vi.mock('../../actions/chat/send-message.action', () => ({
    sendMessageAction: vi.fn(),
}));

vi.mock('../../actions/chat/mark-read.action', () => ({
    markMessagesAsReadAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe('useChatMessages Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const mockChannel = {
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn(),
        };
        const mockSupabase = {
            channel: vi.fn().mockReturnValue(mockChannel),
            removeChannel: vi.fn(),
        };
        vi.spyOn(clientDb, 'createClient').mockReturnValue(mockSupabase as any);
    });

    it('should initialize with initialMessages', () => {
        const initial = [
            {
                id: '1',
                appointmentId: 'appt-1',
                senderRole: 'PATIENT' as const,
                senderName: 'John',
                message: 'Hello',
                createdAt: '2026-07-13',
                isRead: false,
            },
        ];

        const { result } = renderHook(() =>
            useChatMessages({
                appointmentId: 'appt-1',
                initialMessages: initial,
                currentUserRole: 'PATIENT',
                currentUserName: 'John',
            })
        );

        expect(result.current.messages).toEqual(initial);
    });

    it('should call sendMessageAction on sendMessage call', async () => {
        const spySend = vi.spyOn(sendAction, 'sendMessageAction').mockResolvedValue({ data: {} as any });

        const { result } = renderHook(() =>
            useChatMessages({
                appointmentId: 'appt-1',
                initialMessages: [],
                currentUserRole: 'PATIENT',
                currentUserName: 'John',
            })
        );

        await act(async () => {
            await result.current.sendMessage('Test Message');
        });

        expect(spySend).toHaveBeenCalledWith(
            {
                appointmentId: 'appt-1',
                message: 'Test Message',
                senderRole: 'PATIENT',
                senderName: 'John',
            },
            undefined
        );
    });
});
