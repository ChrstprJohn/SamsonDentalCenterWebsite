import { NextRequest } from 'next/server';
import { createAdminClient } from '@/shared/database/server';

function unauthorized(req: NextRequest): boolean {
  const secret = process.env.N8N_TOOL_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') !== `Bearer ${secret}`;
}

/**
 * Returns the latest successfully processed policy PDF text.
 *
 * The document library does not currently have a document-type column, so a
 * policy is identified by "policy" or "privacy" in its file name. n8n can
 * provide ?fileName=... when the exact file should be selected instead.
 */
export async function GET(req: NextRequest) {
  try {
    if (unauthorized(req)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const fileName = req.nextUrl.searchParams.get('fileName')?.trim();
    const supabase = await createAdminClient();

    let query = supabase
      .from('secretary_documents')
      .select('id, file_name, extracted_text, created_at, updated_at')
      .eq('upload_status', 'completed')
      .not('extracted_text', 'is', null)
      .neq('extracted_text', '')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fileName) {
      query = query.eq('file_name', fileName);
    } else {
      query = query.or('file_name.ilike.*policy*,file_name.ilike.*privacy*');
    }

    const { data: document, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch policy document: ${error.message}`);
    }

    if (!document || typeof document.extracted_text !== 'string' || !document.extracted_text.trim()) {
      return Response.json(
        {
          success: false,
          error: fileName
            ? `Processed policy document "${fileName}" not found`
            : 'No processed policy document found. Upload a PDF with "policy" or "privacy" in its file name.',
        },
        { status: 404 },
      );
    }

    return Response.json(
      {
        success: true,
        text: document.extracted_text,
        document: {
          id: document.id,
          fileName: document.file_name,
          createdAt: document.created_at,
          updatedAt: document.updated_at,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch policy document',
      },
      { status: 500 },
    );
  }
}
