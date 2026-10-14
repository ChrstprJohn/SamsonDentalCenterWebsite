/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BookingWizardView } from './booking-wizard-view';
import { DEFAULT_CONFIG } from '@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('../hooks/landing/use-booking-wizard', () => ({ useBookingWizard: () => ({ step: 1, contactSection: { pathway: '', targetDate: '', submittedLocal: false }, fields: {}, maxReachedStep: 1, selectService: vi.fn(), handleStepClick: vi.fn() }) }));
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(0), 0));
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  window.scrollTo = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('renders images from admin service data without substituting local assets for services without uploads', () => {
  const base = { category: 'Orthodontics', durationMinutes: 30, price: null, serviceType: 'GENERAL', isActive: true, status: 'ACTIVE' };
  const services = [
    { ...base, id: 'with-image', name: 'Clear Aligners', imageUrl: '/uploaded-aligners.webp' },
    { ...base, id: 'without-image', name: 'Retainers and Space Maintainers' },
  ] as ServiceResponseDto[];
  const { container } = render(<BookingWizardView services={services} config={{ ...DEFAULT_CONFIG, isBookingOpen: true }} />);
  expect(container.querySelector('#service-card-with-image img')?.getAttribute('src')).toBe('/uploaded-aligners.webp');
  expect(container.querySelector('#service-card-without-image img')).toBeNull();
});
