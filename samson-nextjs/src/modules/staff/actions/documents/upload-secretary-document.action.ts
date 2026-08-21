"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { extractTextFromPDFFile } from '@/modules/staff/utils/extract-pdf-text';
import { revalidatePath } from 'next/cache';

export interface UploadSecretaryDocumentResult {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  extractedText: string;
}

export async function uploadSecretaryDocumentAction(
  formData: FormData
): Promise<{ data: UploadSecretaryDocumentResult } | { error: string }> {
  try {
    // 1. Get the file from form data
    const file = formData.get('file') as File;
    if (!file || !(file instanceof File)) {
      return { error: 'No file provided' };
    }

    // 2. Validate file type
    if (file.type !== 'application/pdf') {
      return { error: 'Invalid file format. Only PDF files are allowed.' };
    }

    // 3. Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: 'File size exceeds the 10MB limit.' };
    }

    // 4. Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'Unauthorized' };
    }

    // 5. Verify user is SECRETARY or ADMIN
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['SECRETARY', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized: insufficient permissions' };
    }

    // 6. Upload to Supabase Storage, namespaced by uploader to avoid collisions
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('secretary-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { error: `Failed to upload document: ${uploadError.message}` };
    }

    // 7. Extract text from PDF
    let extractedText: string | null = null;
    let extractionError: string | null = null;
    try {
      extractedText = await extractTextFromPDFFile(file);
    } catch (extractError) {
      console.error('PDF text extraction failed:', extractError);
      extractionError = extractError instanceof Error ? extractError.message : String(extractError);
    }

    // 8. Save document record to database using admin client
    const adminClient = await createAdminClient();
    const { data: document, error: dbError } = await adminClient
      .from('secretary_documents')
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        extracted_text: extractedText,
        upload_status: extractionError ? 'failed' : 'completed',
        error_message: extractionError,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      // Try to clean up the uploaded file
      await supabase.storage.from('secretary-documents').remove([filePath]);
      return { error: `Failed to save document record: ${dbError.message}` };
    }

    // 9. Revalidate the documents page
    revalidatePath('/secretary-v2/documents');

    return {
      data: {
        id: document.id,
        fileName: document.file_name,
        filePath: document.file_path,
        fileSize: document.file_size,
      extractedText: document.extracted_text || '',
      },
    };
  } catch (error: any) {
    console.error('Upload secretary document error:', error);
    return { error: error.message || 'Failed to upload document' };
  }
}

export async function deleteSecretaryDocumentAction(
  documentId: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'Unauthorized' };
    }

    // Get document to verify ownership and get file path
    const { data: document, error: docError } = await supabase
      .from('secretary_documents')
      .select('file_path, uploaded_by')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return { error: 'Document not found' };
    }

    if (document.uploaded_by !== user.id) {
      return { error: 'Unauthorized: cannot delete document uploaded by another user' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('secretary-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const adminClient = await createAdminClient();
    const { error: dbError } = await adminClient
      .from('secretary_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      return { error: `Failed to delete document: ${dbError.message}` };
    }

    revalidatePath('/secretary-v2/documents');

    return { success: true };
  } catch (error: any) {
    console.error('Delete secretary document error:', error);
    return { error: error.message || 'Failed to delete document' };
  }
}

export async function getSecretaryDocumentsAction(): Promise<
  | { data: Array<{
      id: string;
      file_name: string;
      file_path: string;
      file_size: number;
      mime_type: string;
      extracted_text: string | null;
      error_message: string | null;
      upload_status: string;
      created_at: string;
      uploaded_by: string;
    }> }
  | { error: string }
> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'Unauthorized' };
    }

    // Verify user is SECRETARY or ADMIN
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['SECRETARY', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized: insufficient permissions' };
    }

    const { data: documents, error } = await supabase
      .from('secretary_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: documents || [] };
  } catch (error: any) {
    console.error('Get secretary documents error:', error);
    return { error: error.message || 'Failed to fetch documents' };
  }
}

export async function getSecretaryDocumentUrlAction(
  documentId: string
): Promise<{ data: { url: string } } | { error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: 'Unauthorized' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !['SECRETARY', 'ADMIN'].includes(profile.role)) {
      return { error: 'Unauthorized: insufficient permissions' };
    }

    const { data: document, error: documentError } = await supabase
      .from('secretary_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (documentError || !document) {
      return { error: 'Document not found' };
    }

    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('secretary-documents')
      .createSignedUrl(document.file_path, 60 * 5);

    if (signedUrlError || !signedUrl?.signedUrl) {
      return { error: signedUrlError?.message || 'Failed to create document URL' };
    }

    return { data: { url: signedUrl.signedUrl } };
  } catch (error: any) {
    console.error('Get secretary document URL error:', error);
    return { error: error.message || 'Failed to open document' };
  }
}
