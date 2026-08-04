'use client';

import { useEffect } from 'react';
import { createClient } from '@/shared/database/client';
import { useToast } from '@/components/feedback/toast-container';
import { useRouter } from 'next/navigation';

export function useNotificationsRealtime(userId: string | null) {
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`realtime_notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'recipient_role=eq.SECRETARY',
        },
        (payload: any) => {
          const newNotif = payload.new;

          const isRoleMatch = newNotif.recipient_role === 'SECRETARY';
          const isUserMatch = !newNotif.recipient_id || newNotif.recipient_id === userId;

          if (isRoleMatch && isUserMatch) {
            if (newNotif.priority === 'HIGH') {
              addToast(`[ALERT] ${newNotif.title}: ${newNotif.message}`, 'info');
              router.refresh();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addToast, router]);
}
