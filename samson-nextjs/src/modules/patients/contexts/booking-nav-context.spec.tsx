/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookingNavProvider, useBookingNav } from './booking-nav-context';
import { MockCategoryServicesSection } from '../components/landing/mock-category-services-section';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

const navigation = vi.hoisted(() => ({ push: vi.fn(), pathname: '/' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  usePathname: () => navigation.pathname,
}));
vi.mock('next/link', () => ({ default: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a> }));

function AppointmentButton() {
  const { requestAppt, appointmentLabel } = useBookingNav();
  return <button onClick={() => requestAppt('cleaning', 'Cleaning')}>{appointmentLabel}</button>;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
  navigation.pathname = '/';
});

describe('booking availability navigation', () => {
  it('takes closed-booking visitors directly to the contact section without a loading overlay', () => {
    const scrollIntoView = vi.fn();
    render(<BookingNavProvider isBookingOpen={false}><AppointmentButton /><section id="contact" tabIndex={-1}>Contact</section></BookingNavProvider>);
    const contact = document.getElementById('contact')!;
    contact.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole('button', { name: 'Contact the Clinic' }));
    expect(scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(contact);
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.queryByText(/Taking you to booking/)).toBeNull();
  });

  it('navigates to homepage contact from another page when booking is closed', () => {
    navigation.pathname = '/privacy';
    render(<BookingNavProvider isBookingOpen={false}><AppointmentButton /></BookingNavProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Contact the Clinic' }));
    expect(navigation.push).toHaveBeenCalledWith('/#contact');
  });

  it('preserves the selected service when booking is open', () => {
    vi.useFakeTimers();
    render(<BookingNavProvider><AppointmentButton /></BookingNavProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Request Appointment' }));
    vi.advanceTimersByTime(600);
    expect(navigation.push).toHaveBeenCalledWith('/book?serviceId=cleaning');
  });

  it('keeps closed-booking service categories read-only and offers contact for consultation', () => {
    const services = [{ id: 'cleaning', name: 'Cleaning', category: 'Preventive Dentistry' }] as ServiceResponseDto[];
    render(<BookingNavProvider isBookingOpen={false}><MockCategoryServicesSection dbServices={services} /></BookingNavProvider>);
    fireEvent.click(screen.getByText('Preventive Dentistry'));
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Preventive Dentistry/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Contact the Clinic' }).getAttribute('href')).toBe('/#contact');
  });
});
