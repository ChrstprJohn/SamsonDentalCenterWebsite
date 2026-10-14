/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { LandingView } from './landing-view';
import { useLandingView } from '../hooks/landing/use-landing-view';
import { vi, describe, it, expect, afterEach } from 'vitest';

vi.mock('../hooks/landing/use-landing-view', () => ({
  useLandingView: vi.fn(),
}));

const mockRequestAppt = vi.fn();
const mockPush = vi.fn();
let mockIsBookingOpen = false;
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('../contexts/booking-nav-context', () => ({
  useBookingNav: () => ({
    requestAppt: mockRequestAppt,
    contactClinic: mockRequestAppt,
    isBookingOpen: mockIsBookingOpen,
    isNavigatingBooking: false,
    pendingServiceName: null,
  }),
}));

vi.mock('../components/landing/hero-section-preview', () => ({ HeroSectionPreview: () => <div data-testid="hero-section-preview" /> }));
vi.mock('../components/landing/hero-section-v1', () => ({ HeroSectionV1: () => <div data-testid="hero-section-v1" /> }));
vi.mock('../components/landing/hero-section-v2', () => ({ HeroSectionV2: () => <div data-testid="hero-section-v2" /> }));
vi.mock('../components/landing/mock-category-services-section', async (importOriginal) => ({
  ...await importOriginal<typeof import('../components/landing/mock-category-services-section')>(),
  ServiceDescription: ({ description }: { description?: string }) => <p>{description}</p>,
  MockCategoryServicesSection: ({ onBook }: any) => (
    <div data-testid="mock-category-services-section">
      <button onClick={() => onBook('s1')}>Select Service</button>
    </div>
  ),
}));
vi.mock('../components/landing/about-section', () => ({ AboutSection: () => <div data-testid="about-section" /> }));
vi.mock('../components/landing/why-choose-us-section', () => ({ WhyChooseUsSection: () => <div data-testid="why-choose-us-section" /> }));
vi.mock('../components/landing/companies-section', () => ({ CompaniesSection: () => <div data-testid="companies-section" /> }));
vi.mock('../components/landing/gallery-section', () => ({ GallerySection: () => <div data-testid="gallery-section" /> }));
vi.mock('../components/landing/testimonials-section', () => ({ TestimonialsSection: () => <div data-testid="testimonials-section" /> }));
vi.mock('../components/landing/faq-section', () => ({ FaqSection: () => <div data-testid="faq-section" /> }));
vi.mock('../components/landing/chat-section', () => ({ ChatSection: () => <div data-testid="chat-section" /> }));
vi.mock('../components/landing/contact-section', () => ({ ContactSection: () => <div data-testid="contact-section" /> }));
vi.mock('../components/landing/appointment-banner-section', () => ({ AppointmentBannerSection: () => <div data-testid="appointment-banner-section" /> }));

describe('LandingView', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); mockIsBookingOpen = false; });
  const mockConfig = { id: 'c1', name: 'Test Clinic', address: '123 Test St', phone: '123', email: 'test@test.com', workingHours: [] } as any;

  it('showcases the ten categories without individual treatments when booking is closed', () => {
    (useLandingView as any).mockReturnValue({ contactForm: {} });
    render(<LandingView services={[{ id: 'real-service', name: 'Dental Examination', description: 'An assessment of your oral health.', category: 'Consultation' } as any]} config={{ ...mockConfig, isBookingOpen: false }} reviews={[]} />);
    expect(screen.queryByText('Dental Examination')).toBeNull();
    expect(screen.getByText('Consultation')).toBeDefined();
    expect(document.querySelectorAll('#services article')).toHaveLength(10);
    expect(screen.queryByTestId('mock-category-services-section')).toBeNull();
    expect(document.querySelector('#services article button')).toBeNull();
    screen.getByRole('button', { name: 'Contact the Clinic' }).click();
    expect(mockRequestAppt).toHaveBeenCalled();
    expect(document.querySelector('#services a')).toBeNull();
  });

  it('keeps the category showcase when the treatment catalog is empty', () => {
    (useLandingView as any).mockReturnValue({ contactForm: {} });
    render(<LandingView services={[]} config={{ ...mockConfig, isBookingOpen: false }} reviews={[]} />);
    expect(document.querySelectorAll('#services article')).toHaveLength(10);
    expect(screen.queryByText('Routine Dental Cleaning')).toBeNull();
  });

  it('keeps categories read-only and offers consultation booking when enabled', () => {
    mockIsBookingOpen = true;
    const requestAppt = vi.fn();
    (useLandingView as any).mockReturnValue({
      selectedService: null,
      setSelectedService: vi.fn(),
      contactForm: {},
      requestAppt,
    });

    render(<LandingView services={[]} config={{ ...mockConfig, isBookingOpen: true }} reviews={[]} />);

    expect(screen.getByTestId('hero-section-preview')).toBeDefined();
    expect(screen.queryByTestId('mock-category-services-section')).toBeNull();
    expect(document.querySelectorAll('#services article')).toHaveLength(10);
    expect(document.querySelector('#services article button')).toBeNull();
    expect(screen.getByTestId('about-section')).toBeDefined();
    expect(screen.getByTestId('why-choose-us-section')).toBeDefined();
    expect(screen.getByTestId('companies-section')).toBeDefined();
    expect(screen.getByTestId('gallery-section')).toBeDefined();
    expect(screen.getByTestId('faq-section')).toBeDefined();
    expect(screen.getByTestId('chat-section')).toBeDefined();
    expect(screen.getByTestId('contact-section')).toBeDefined();
    expect(screen.getByTestId('appointment-banner-section')).toBeDefined();

    screen.getByRole('button', { name: 'Book a Consultation' }).click();
    expect(mockPush).toHaveBeenCalledWith('/book?category=Consultation');
    expect(mockRequestAppt).not.toHaveBeenCalled();
  });
});
