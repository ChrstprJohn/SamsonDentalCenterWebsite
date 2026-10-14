'use client';

import { useContext, type ComponentProps } from 'react';
import { NavbarV1 } from './navbar-v1';
import { BookingNavContext, BookingNavProvider } from '@/modules/patients/contexts/booking-nav-context';

export { NAV_ITEMS } from './navbar-v1';

export function Navbar(props: ComponentProps<typeof NavbarV1>) {
  const bookingNav = useContext(BookingNavContext);
  if (bookingNav) return <NavbarV1 {...props} />;

  return (
    <BookingNavProvider isBookingOpen={props.config?.isBookingOpen ?? true}>
      <NavbarV1 {...props} />
    </BookingNavProvider>
  );
}
