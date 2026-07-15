import { describe, it, expect, vi } from 'vitest';
import { getMessagesByAppointmentIdQuery, getChatThreadsForSecretaryQuery, validateChatTokenQuery } from './chat.queries';
import { SupabaseClient } from '@supabase/supabase-js';

describe('ChatQueries', () => {
    it('getMessagesByAppointmentIdQuery should fetch messages with pagination', async () => {
        const mockMessages = [
            {
                id: 'c2a71d23-28ad-4c81-8178-5e4c622a59a7',
                appointment_id: 'd3b82e34-39be-5d92-9289-6f5d733b6ab8',
                sender_role: 'PATIENT',
                sender_name: 'John',
                message: 'Hello',
                created_at: '2026-07-13T12:00:00Z',
                is_read: false,
            },
        ];

        const mockLimit = vi.fn().mockResolvedValue({ data: mockMessages, error: null });
        const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
        const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockSupabase = {
            from: vi.fn().mockReturnValue({ select: mockSelect }),
        } as unknown as SupabaseClient;

        const query = getMessagesByAppointmentIdQuery(mockSupabase);
        const result = await query('d3b82e34-39be-5d92-9289-6f5d733b6ab8');

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].id).toBe('c2a71d23-28ad-4c81-8178-5e4c622a59a7');
        expect(result.hasMore).toBe(false);
        expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('validateChatTokenQuery should return mapped guest data if valid', async () => {
        const mockData = {
            id: 'd3b82e34-39be-5d92-9289-6f5d733b6ab8',
            status: 'APPROVED',
            date: '2026-07-15',
            preferred_start_time: '10:00',
            patient: null,
            guest_contacts: [
                {
                    first_name: 'Alice',
                    last_name: 'Smith',
                    email: 'alice@example.com',
                },
            ],
            service: {
                name: 'Teeth Cleaning',
            },
        };

        const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null });
        const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
        const mockSupabase = {
            from: vi.fn().mockReturnValue({ select: mockSelect }),
        } as unknown as SupabaseClient;

        const query = validateChatTokenQuery(mockSupabase);
        const result = await query('d3b82e34-39be-5d92-9289-6f5d733b6ab8', 'token-abc');

        expect(result).not.toBeNull();
        expect(result.patientName).toBe('Alice Smith');
        expect(result.serviceName).toBe('Teeth Cleaning');
        expect(mockEq1).toHaveBeenCalledWith('id', 'd3b82e34-39be-5d92-9289-6f5d733b6ab8');
        expect(mockEq2).toHaveBeenCalledWith('chat_token', 'token-abc');
    });
});
