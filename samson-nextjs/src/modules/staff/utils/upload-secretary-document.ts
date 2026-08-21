import { createClient } from '@/shared/database/client';

export async function uploadSecretaryDocument(file: File, clinicId: string): Promise<string> {
  // 1. Validation
  const validTypes = ['application/pdf'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file format. Only PDF files are allowed.');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds the 10MB limit.');
  }

  // 2. Upload to Supabase Storage
  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'pdf';
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${clinicId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('secretary-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }

  // 3. Get Public URL (signed URL for private bucket)
  const { data: { publicUrl } } = supabase.storage
    .from('secretary-documents')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteSecretaryDocument(filePath: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from('secretary-documents')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}