import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { getUnreadNotifications, getUnreadCount } from './notifications.queries';

describe('NotificationsQueries', () => {
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
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: [mockNotification], count: 1, error: null }),
    };
  });

  describe('getUnreadNotifications', () => {
    it('successfully queries with filters and limit', async () => {
      const result = await getUnreadNotifications(mockSupabase as unknown as SupabaseClient)('user-123', 'SECRETARY', 5);

      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('is_archived', false);
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockSupabase.limit).toHaveBeenCalledWith(5);
      expect(mockSupabase.or).toHaveBeenCalledWith('recipient_id.eq.user-123,recipient_role.eq.SECRETARY');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockNotification.id);
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread count from database response', async () => {
      const count = await getUnreadCount(mockSupabase as unknown as SupabaseClient)('user-123', 'SECRETARY');

      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(count).toBe(1);
    });
  });
});
