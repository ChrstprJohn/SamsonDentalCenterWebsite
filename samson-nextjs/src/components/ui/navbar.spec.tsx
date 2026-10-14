import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Navbar } from './navbar';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/admin' }));

describe('portal navbar', () => {
  it('renders outside the marketing layout without requiring an existing booking provider', () => {
    expect(renderToString(<Navbar />)).toContain('Request Appointment');
  });

  it('uses the clinic booking state in its portal fallback provider', () => {
    const config = { isBookingOpen: false } as ClinicConfigResponseDto;
    expect(renderToString(<Navbar config={config} />)).toContain('Contact the Clinic');
  });
});
