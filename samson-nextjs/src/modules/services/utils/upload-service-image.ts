import { createClient } from '@/shared/database/client';

export async function uploadServiceImage(file: File): Promise<string> {
  // 1. Validation
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file format. Only JPG, PNG, and WebP are allowed.');
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds the 2MB limit.');
  }

  // 2. Upload to Supabase Storage
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `service-images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('services-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // 3. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('services-images')
    .getPublicUrl(filePath);

  return publicUrl;
}
