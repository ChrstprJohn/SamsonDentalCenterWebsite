'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/shared/database/client';
import { useToast } from '@/components/feedback/toast-container';
import { useRouter } from 'next/navigation';

export function useNotificationsRealtime(userId: string | null) {
  const { addToast } = useToast();
  const router = useRouter();
  // Stable ref so the realtime callback always uses the latest router
  // without triggering a re-subscription on every navigation.
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setup = async () => {
      // @supabase/ssr createBrowserClient does NOT automatically pass the
      // session JWT to the realtime websocket — it connects as `anon` by
      // default, which causes RLS to silently block postgres_changes events.
      // We must explicitly call setAuth with the current access token.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      channel = supabase
        .channel(`realtime_notifications_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload: any) => {
            const newNotif = payload.new;
            if (!newNotif) return;

            const isRoleMatch = newNotif.recipient_role === 'SECRETARY';
            const isUserMatch = !newNotif.recipient_id || newNotif.recipient_id === userId;

            if (isRoleMatch && isUserMatch) {
              addToast(`${newNotif.title}: ${newNotif.message}`, 'info');
              routerRef.current.refresh();
            }
          }
        )
        .subscribe((status: string, err?: Error) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('[notif-realtime] CHANNEL_ERROR', err);
          }
        });
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, addToast]);
}
