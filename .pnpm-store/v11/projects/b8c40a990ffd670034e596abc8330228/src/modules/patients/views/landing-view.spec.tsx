/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { LandingView } from './landing-view';
import { useLandingView } from '../hooks/landing/use-landing-view';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../hooks/landing/use-landing-view', () => ({
  useLandingView: vi.fn(),
}));

vi.mock('../components/landing/hero-section-v1', () => ({ HeroSectionV1: () => <div data-testid="hero-section-v1" /> }));
vi.mock('../components/landing/hero-section-v2', () => ({ HeroSectionV2: () => <div data-testid="hero-section-v2" /> }));
vi.mock('../components/landing/services-section', () => ({ ServicesSection: () => <div data-testid="services-section" /> }));
vi.mock('../components/landing/about-section', () => ({ AboutSection: () => <div data-testid="about-section" /> }));
vi.mock('../components/landing/gallery-section', () => ({ GallerySection: () => <div data-testid="gallery-section" /> }));
vi.mock('../components/landing/contact-section', () => ({ ContactSection: () => <div data-testid="contact-section" /> }));
vi.mock('@/components/ui/modal', () => ({ Modal: ({ children, isOpen }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null) }));

describe('LandingView', () => {
  const mockConfig = { id: 'c1', name: 'Test Clinic', address: '123 Test St', phone: '123', email: 'test@test.com', workingHours: [] } as any;

  it('should render all sections correctly', () => {
    (useLandingView as any).mockReturnValue({
      selectedService: null,
      setSelectedService: vi.fn(),
      contactForm: {},
      handleBookingCTA: vi.fn(),
    });

    render(<LandingView services={[]} config={mockConfig} isAuthenticated={false} />);

    expect(screen.getByTestId('hero-section-v1')).toBeDefined();
    expect(screen.getByTestId('services-section')).toBeDefined();
    expect(screen.getByTestId('about-section')).toBeDefined();
    expect(screen.getByTestId('gallery-section')).toBeDefined();
    expect(screen.getByTestId('contact-section')).toBeDefined();
    expect(screen.queryByTestId('modal')).toBeNull();
  });

  it('should render modal when a service is selected', () => {
    (useLandingView as any).mockReturnValue({
      selectedService: { id: 's1', name: 'Test Service', description: 'Test', durationMinutes: 30, price: 50 },
      setSelectedService: vi.fn(),
      contactForm: {},
      handleBookingCTA: vi.fn(),
    });

    render(<LandingView services={[]} config={mockConfig} isAuthenticated={false} />);

    expect(screen.getByTestId('modal')).toBeDefined();
    expect(screen.getByText('Test')).toBeDefined();
    expect(screen.getByText('⏳ 30 mins')).toBeDefined();
  });
});
