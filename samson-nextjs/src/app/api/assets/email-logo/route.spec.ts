import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/shared/database/server';
import { getClinicConfigUseCase } from '@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case';

vi.mock('@/shared/database/server');
vi.mock('@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case');

describe('GET /api/assets/email-logo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue({} as any);
  });

  it('proxies remote image from clinic config when available', async () => {
    vi.mocked(getClinicConfigUseCase).mockReturnValue(async () => ({
      emailLogoUrl: 'https://example.com/logo.png',
      emailLogoDarkUrl: 'https://example.com/logo-dark.png',
    } as any));

    const fakeImageBuffer = new Uint8Array([137, 80, 78, 71]).buffer;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (header: string) => (header === 'content-type' ? 'image/png' : null),
      },
      arrayBuffer: async () => fakeImageBuffer,
    } as any);

    const req = new NextRequest('http://localhost:3000/api/assets/email-logo?variant=light');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toContain('public');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/logo.png',
      expect.objectContaining({ next: { revalidate: 3600 } })
    );
  });

  it('fetches dark mode variant when variant=dark is specified', async () => {
    vi.mocked(getClinicConfigUseCase).mockReturnValue(async () => ({
      emailLogoUrl: 'https://example.com/logo-light.png',
      emailLogoDarkUrl: 'https://example.com/logo-dark.png',
    } as any));

    const fakeImageBuffer = new Uint8Array([137, 80, 78, 71]).buffer;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (header: string) => (header === 'content-type' ? 'image/png' : null),
      },
      arrayBuffer: async () => fakeImageBuffer,
    } as any);

    const req = new NextRequest('http://localhost:3000/api/assets/email-logo?variant=dark');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/logo-dark.png',
      expect.anything()
    );
  });

  it('falls back to local static asset or fallback buffer if fetch fails or no remote url is configured', async () => {
    vi.mocked(getClinicConfigUseCase).mockReturnValue(async () => ({} as any));

    const req = new NextRequest('http://localhost:3000/api/assets/email-logo');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Cache-Control')).toContain('public');
  });
});
