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

vi.mock('../components/landing/hero-section-preview', () => ({ HeroSectionPreview: () => <div data-testid="hero-section-preview" /> }));
vi.mock('../components/landing/hero-section-v1', () => ({ HeroSectionV1: () => <div data-testid="hero-section-v1" /> }));
vi.mock('../components/landing/hero-section-v2', () => ({ HeroSectionV2: () => <div data-testid="hero-section-v2" /> }));
vi.mock('../components/landing/services-section', () => ({
  ServicesSection: ({ onSelectService }: any) => (
    <div data-testid="services-section">
      <button onClick={() => onSelectService({ id: 's1' })}>Select Service</button>
    </div>
  ),
}));
vi.mock('../components/landing/about-section', () => ({ AboutSection: () => <div data-testid="about-section" /> }));
vi.mock('../components/landing/gallery-section', () => ({ GallerySection: () => <div data-testid="gallery-section" /> }));
vi.mock('../components/landing/testimonials-section', () => ({ TestimonialsSection: () => <div data-testid="testimonials-section" /> }));
vi.mock('../components/landing/faq-section', () => ({ FaqSection: () => <div data-testid="faq-section" /> }));
vi.mock('../components/landing/contact-section', () => ({ ContactSection: () => <div data-testid="contact-section" /> }));

describe('LandingView', () => {
  const mockConfig = { id: 'c1', name: 'Test Clinic', address: '123 Test St', phone: '123', email: 'test@test.com', workingHours: [] } as any;

  it('should render all sections correctly and trigger handleBookingCTA on service select', () => {
    const handleBookingCTA = vi.fn();
    (useLandingView as any).mockReturnValue({
      selectedService: null,
      setSelectedService: vi.fn(),
      contactForm: {},
      handleBookingCTA,
    });

    render(<LandingView services={[]} config={mockConfig} reviews={[]} />);

    expect(screen.getByTestId('hero-section-preview')).toBeDefined();
    expect(screen.getByTestId('services-section')).toBeDefined();
    expect(screen.getByTestId('about-section')).toBeDefined();
    expect(screen.getByTestId('gallery-section')).toBeDefined();
    expect(screen.getByTestId('faq-section')).toBeDefined();
    expect(screen.getByTestId('contact-section')).toBeDefined();

    screen.getByText('Select Service').click();
    expect(handleBookingCTA).toHaveBeenCalledWith('s1');
  });
});
