import { describe, it, expect, vi, beforeEach } from 'vitest';
import { outboxCommands } from './outbox.commands';
import { SupabaseClient } from '@supabase/supabase-js';

describe('outboxCommands', () => {
  let mockSupabase: any;
  let commands: ReturnType<typeof outboxCommands>;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
      rpc: vi.fn(),
    };
    commands = outboxCommands(mockSupabase as unknown as SupabaseClient);
  });

  describe('emitEvent', () => {
    it('successfully inserts an event into outbox', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      await commands.emitEvent('TEST_EVENT', { foo: 'bar' });

      expect(mockSupabase.from).toHaveBeenCalledWith('outbox');
      expect(mockInsert).toHaveBeenCalledWith({
        event_type: 'TEST_EVENT',
        payload: { foo: 'bar' },
        status: 'PENDING',
      });
    });

    it('throws error if insert fails', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'Database error' } });
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      await expect(commands.emitEvent('TEST_EVENT', { foo: 'bar' }))
        .rejects.toThrow('Failed to emit event: Database error');
    });
  });

  describe('claimPendingEvents', () => {
    it('claims pending events using supabase RPC', async () => {
      const mockEvents = [
        { id: '1', event_type: 'TEST_EVENT', payload: {}, status: 'PROCESSING', error_logs: null, retry_count: 0 }
      ];
      mockSupabase.rpc.mockResolvedValue({ data: mockEvents, error: null });

      const result = await commands.claimPendingEvents(5);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('claim_pending_events', { batch_size: 5 });
      expect(result).toEqual(mockEvents);
    });

    it('throws error if RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'RPC Error' } });

      await expect(commands.claimPendingEvents())
        .rejects.toThrow('Failed to claim events: RPC Error');
    });
  });

  describe('markAsProcessed', () => {
    it('marks event as processed', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      await commands.markAsProcessed('event-uuid');

      expect(mockSupabase.from).toHaveBeenCalledWith('outbox');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'PROCESSED' });
      expect(mockEq).toHaveBeenCalledWith('id', 'event-uuid');
    });

    it('throws error if marking processed fails', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      await expect(commands.markAsProcessed('event-uuid'))
        .rejects.toThrow('Failed to mark event as processed: Update failed');
    });
  });

  describe('markAsFailed', () => {
    it('re-queues event if retry_count < 3', async () => {
      // 1. Mock select retry_count
      const mockSingle = vi.fn().mockResolvedValue({ data: { retry_count: 1 }, error: null });
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

      // 2. Mock update
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'outbox') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        return {} as any;
      });

      await commands.markAsFailed('event-uuid', 'Some error log');

      expect(mockSelect).toHaveBeenCalledWith('retry_count');
      expect(mockSelectEq).toHaveBeenCalledWith('id', 'event-uuid');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'PENDING',
        error_logs: 'Some error log',
        retry_count: 2,
      });
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'event-uuid');
    });

    it('marks event status as FAILED if retry_count >= 3', async () => {
      // 1. Mock select retry_count
      const mockSingle = vi.fn().mockResolvedValue({ data: { retry_count: 3 }, error: null });
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

      // 2. Mock update
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'outbox') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        return {} as any;
      });

      await commands.markAsFailed('event-uuid', 'Max retries exceeded');

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'FAILED',
        error_logs: 'Max retries exceeded',
        retry_count: 4,
      });
    });

    it('throws error if mark failed update throws error', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: { retry_count: 0 }, error: null });
      const mockSelectEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockSelectEq });

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: { message: 'Write lock failed' } });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'outbox') {
          return {
            select: mockSelect,
            update: mockUpdate,
          };
        }
        return {} as any;
      });

      await expect(commands.markAsFailed('event-uuid', 'Some error'))
        .rejects.toThrow('Failed to mark event as failed: Write lock failed');
    });
  });
});
