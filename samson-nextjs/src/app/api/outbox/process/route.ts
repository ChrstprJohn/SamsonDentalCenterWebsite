import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { createAdminClient } from '@/shared/database/server';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';
import { NextRequest } from 'next/server';

async function handleProcess(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    bootstrapEventSubscribers();
    const supabaseAdmin = await createAdminClient();
    await supabaseAdmin.rpc('scan_and_queue_appointment_reminders');
    await supabaseAdmin.rpc('scan_and_queue_checkout_follow_ups');
    await globalOutboxDispatcher(supabaseAdmin)();
    return Response.json({ success: true, message: 'Outbox processed successfully.' });
  } catch (error: any) {
    console.error('ERROR (processing outbox webhook):', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleProcess(req);
}

export async function GET(req: NextRequest) {
  return handleProcess(req);
}

