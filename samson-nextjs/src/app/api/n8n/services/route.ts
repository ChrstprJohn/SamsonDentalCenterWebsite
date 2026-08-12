import { NextRequest } from 'next/server';
import { createAdminClient } from '@/shared/database/server';
import { encodeServiceId } from '@/shared/utils/service-short-id';
import { getServicesQuery } from '@/modules/services/repositories/management/service.queries';

function unauthorized(req: NextRequest): boolean {
  const secret = process.env.N8N_TOOL_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') !== `Bearer ${secret}`;
}

function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  try {
    if (unauthorized(req)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createAdminClient();
    const services = await getServicesQuery(supabase)(false);
    const rows = services.map((service) =>
      [
        csvField(encodeServiceId(service.id)),
        csvField(service.name),
        csvField((service.description ?? '').slice(0, 120)),
      ].join(',')
    );
    const csv = ['id,name,description', ...rows].join('\n');
    return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8' } });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
