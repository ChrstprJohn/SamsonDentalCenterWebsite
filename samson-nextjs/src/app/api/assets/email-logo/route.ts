import { NextRequest } from 'next/server';
import { createAdminClient } from '@/shared/database/server';
import { getClinicConfigQuery } from '@/modules/clinic-config/repositories/settings/clinic-config.queries';
import { getClinicConfigUseCase } from '@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case';
import fs from 'fs/promises';
import path from 'path';

// Force dynamic execution since logo URLs may be updated in clinic settings
export const dynamic = 'force-dynamic';

const CACHE_HEADER = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400';

async function getLocalFallbackBuffer(): Promise<Buffer | null> {
  try {
    const candidates = [
      path.join(process.cwd(), 'public', 'images', 'SAMSONLOGO.png'),
      path.join(process.cwd(), 'public', 'images', 'NewLogo (1).png'),
    ];

    for (const filePath of candidates) {
      try {
        return await fs.readFile(filePath);
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.error('Failed to read local fallback logo image:', err);
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const variant = searchParams.get('variant') === 'dark' ? 'dark' : 'light';

  let targetUrl: string | null = null;

  try {
    const supabase = await createAdminClient();
    const config = await getClinicConfigUseCase(getClinicConfigQuery(supabase))();

    if (variant === 'dark') {
      targetUrl = config?.emailLogoDarkUrl || config?.websiteLogoDarkUrl || config?.emailLogoUrl || config?.websiteLogoUrl || null;
    } else {
      targetUrl = config?.emailLogoUrl || config?.websiteLogoUrl || null;
    }
  } catch (err) {
    console.warn('Failed to load clinic config for email logo asset proxy:', err);
  }

  // If a remote URL (e.g. Supabase bucket) is configured, fetch and proxy it
  if (targetUrl && /^https?:\/\//i.test(targetUrl)) {
    try {
      const response = await fetch(targetUrl, {
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': CACHE_HEADER,
          },
        });
      }
    } catch (fetchErr) {
      console.error(`Failed to proxy remote logo (${targetUrl}):`, fetchErr);
    }
  }

  // Fallback to local static asset
  const localBuffer = await getLocalFallbackBuffer();
  if (localBuffer) {
    return new Response(localBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': CACHE_HEADER,
      },
    });
  }

  // 1x1 transparent PNG fallback if no local or remote image found
  const transparentPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const transparentBuffer = Buffer.from(transparentPixelBase64, 'base64');
  return new Response(transparentBuffer as any, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': CACHE_HEADER,
    },
  });
}
