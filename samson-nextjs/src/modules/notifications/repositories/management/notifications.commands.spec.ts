import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { insertNotification, updateNotification, markAllNotificationsRead } from './notifications.commands';

describe('NotificationsCommands', () => {
  let mockSupabase: any;
  const mockNotification = {
    id: 'f94db123-ca40-4841-9a88-6a1fc4063501',
    recipient_role: 'SECRETARY',
    recipient_id: 'f94db123-ca40-4841-9a88-6a1fc4063502',
    type: 'TREATMENT_RENDERED',
    priority: 'HIGH',
    title: 'Ready for Checkout',
    message: 'Finished treatment',
    link_url: '/secretary/check-in?openCheckout=123',
    entity_id: '123',
    is_read: false,
    is_archived: false,
    created_at: '2026-06-30T07:00:00.000Z',
  };

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockNotification, error: null }),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ error: null }),
    };
  });

  describe('insertNotification', () => {
    it('successfully inserts and parses response', async () => {
      const result = await insertNotification(mockSupabase as unknown as SupabaseClient)({
        recipientRole: 'SECRETARY',
        recipientId: 'f94db123-ca40-4841-9a88-6a1fc4063502',
        type: 'TREATMENT_RENDERED',
        priority: 'HIGH',
        title: 'Ready for Checkout',
        message: 'Finished treatment',
        linkUrl: '/secretary/check-in?openCheckout=123',
        entityId: '123',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        recipient_role: 'SECRETARY',
        recipient_id: 'f94db123-ca40-4841-9a88-6a1fc4063502',
        type: 'TREATMENT_RENDERED',
        priority: 'HIGH',
        title: 'Ready for Checkout',
        message: 'Finished treatment',
        link_url: '/secretary/check-in?openCheckout=123',
        entity_id: '123',
      });
      expect(result.id).toBe(mockNotification.id);
      expect(result.recipientRole).toBe('SECRETARY');
    });
  });

  describe('updateNotification', () => {
    it('successfully updates status and parses response', async () => {
      const result = await updateNotification(mockSupabase as unknown as SupabaseClient)({
        id: mockNotification.id,
        isRead: true,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
      expect(mockSupabase.update).toHaveBeenCalledWith({ is_read: true });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockNotification.id);
      expect(result.id).toBe(mockNotification.id);
    });
  });

  describe('markAllNotificationsRead', () => {
    it('calls update for the recipient/role', async () => {
      await markAllNotificationsRead(mockSupabase as unknown as SupabaseClient)('user-123', 'SECRETARY');

      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
      expect(mockSupabase.update).toHaveBeenCalledWith({ is_read: true });
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_read', false);
      expect(mockSupabase.or).toHaveBeenCalledWith('recipient_id.eq.user-123,recipient_role.eq.SECRETARY');
    });
  });
});
