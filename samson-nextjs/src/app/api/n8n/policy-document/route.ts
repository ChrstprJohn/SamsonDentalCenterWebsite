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
      .order('created_at', { ascending: false });

    if (fileName) {
      query = query.ilike('file_name', `%${fileName}%`);
    }

    const { data: documents, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch policy documents: ${error.message}`);
    }

    interface DocumentRecord {
      id: string;
      file_name: string;
      extracted_text: string | null;
      created_at: string;
      updated_at: string;
    }

    const validDocs = ((documents || []) as DocumentRecord[]).filter(
      (doc): doc is DocumentRecord & { extracted_text: string } =>
        typeof doc.extracted_text === 'string' && doc.extracted_text.trim().length > 0,
    );

    if (validDocs.length === 0) {
      return Response.json(
        {
          success: false,
          error: fileName
            ? `Processed document matching "${fileName}" not found`
            : 'No processed documents with extracted text found. Please upload and process documents in the Secretary Documents panel.',
        },
        { status: 404 },
      );
    }

    // Combine extracted text across all policy documents with clear section headers
    const combinedText = validDocs
      .map((doc) => `--- DOCUMENT: ${doc.file_name} ---\n${doc.extracted_text.trim()}`)
      .join('\n\n');

    return Response.json(
      {
        success: true,
        count: validDocs.length,
        text: combinedText,
        document: {
          id: validDocs[0].id,
          fileName: validDocs[0].file_name,
          createdAt: validDocs[0].created_at,
          updatedAt: validDocs[0].updated_at,
        },
        documents: validDocs.map((doc) => ({
          id: doc.id,
          fileName: doc.file_name,
          text: doc.extracted_text,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
        })),
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
