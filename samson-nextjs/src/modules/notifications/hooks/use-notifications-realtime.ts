'use client';

import { useEffect } from 'react';
import { createClient } from '@/shared/database/client';
import { useToast } from '@/components/feedback/toast-container';
import { useRouter } from 'next/navigation';

export function useNotificationsRealtime(userId: string | null) {
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    console.log('[Realtime] Subscribing to notifications. User ID:', userId);

    const channel = supabase
      .channel('realtime_notifications_channels')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload: any) => {
          const newNotif = payload.new;
          console.log('[Realtime] New notification inserted:', newNotif);

          const isRoleMatch = newNotif.recipient_role === 'SECRETARY';
          const isUserMatch = !newNotif.recipient_id || newNotif.recipient_id === userId;

          if (isRoleMatch && isUserMatch) {
            if (newNotif.priority === 'HIGH') {
              console.log('[Realtime] Firing toast popup for:', newNotif.title);
              addToast(`[ALERT] ${newNotif.title}: ${newNotif.message}`, 'info');
              router.refresh();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
      });

    return () => {
      console.log('[Realtime] Cleaning up channel subscription.');
      supabase.removeChannel(channel);
    };
  }, [userId, addToast, router]);
}
