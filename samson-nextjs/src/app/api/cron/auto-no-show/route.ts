import { createAdminClient } from '@/shared/database/server';
import { NextRequest } from 'next/server';

async function handleAutoNoShow(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseAdmin = await createAdminClient();
    const { data: updatedCount, error } = await supabaseAdmin.rpc('scan_and_mark_expired_no_shows');

    if (error) {
      console.error('ERROR (auto-no-show cron RPC):', error);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `Auto no-show scan completed. Updated ${updatedCount || 0} appointment(s).`,
      count: updatedCount || 0,
    });
  } catch (error: any) {
    console.error('ERROR (auto-no-show cron endpoint):', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleAutoNoShow(req);
}

export async function GET(req: NextRequest) {
  return handleAutoNoShow(req);
}
