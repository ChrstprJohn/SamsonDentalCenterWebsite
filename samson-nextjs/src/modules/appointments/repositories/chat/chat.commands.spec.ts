import { describe, it, expect, vi } from 'vitest';
import { insertMessageCommand, markMessagesAsReadCommand } from './chat.commands';
import { SupabaseClient } from '@supabase/supabase-js';

describe('ChatCommands', () => {
    it('insertMessageCommand should call insert and return parsed data', async () => {
        const mockResponse = {
            id: 'c2a71d23-28ad-4c81-8178-5e4c622a59a7',
            appointment_id: 'd3b82e34-39be-5d92-9289-6f5d733b6ab8',
            sender_role: 'PATIENT',
            sender_name: 'John Doe',
            message: 'Hello!',
            created_at: '2026-07-13T12:00:00Z',
            is_read: false,
        };

        const mockSingle = vi.fn().mockResolvedValue({ data: mockResponse, error: null });
        const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
        const mockSupabase = {
            from: vi.fn().mockReturnValue({ insert: mockInsert }),
        } as unknown as SupabaseClient;

        const command = insertMessageCommand(mockSupabase);
        const result = await command({
            appointmentId: 'd3b82e34-39be-5d92-9289-6f5d733b6ab8',
            senderRole: 'PATIENT',
            senderName: 'John Doe',
            message: 'Hello!',
        });

        expect(result.id).toBe('c2a71d23-28ad-4c81-8178-5e4c622a59a7');
        expect(mockSupabase.from).toHaveBeenCalledWith('appointment_messages');
        expect(mockInsert).toHaveBeenCalledWith([
            {
                appointment_id: 'd3b82e34-39be-5d92-9289-6f5d733b6ab8',
                sender_role: 'PATIENT',
                sender_name: 'John Doe',
                message: 'Hello!',
            },
        ]);
    });

    it('markMessagesAsReadCommand should perform update on database', async () => {
        const mockEq3 = vi.fn().mockResolvedValue({ error: null });
        const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
        const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 });
        const mockSupabase = {
            from: vi.fn().mockReturnValue({ update: mockUpdate }),
        } as unknown as SupabaseClient;

        const command = markMessagesAsReadCommand(mockSupabase);
        await command('d3b82e34-39be-5d92-9289-6f5d733b6ab8', 'PATIENT');

        expect(mockSupabase.from).toHaveBeenCalledWith('appointment_messages');
        expect(mockUpdate).toHaveBeenCalledWith({ is_read: true });
        expect(mockEq1).toHaveBeenCalledWith('appointment_id', 'd3b82e34-39be-5d92-9289-6f5d733b6ab8');
        expect(mockEq2).toHaveBeenCalledWith('sender_role', 'PATIENT');
        expect(mockEq3).toHaveBeenCalledWith('is_read', false);
    });
});
