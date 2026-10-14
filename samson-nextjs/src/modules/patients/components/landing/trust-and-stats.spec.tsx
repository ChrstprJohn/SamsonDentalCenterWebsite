/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { TrustAndStats } from './trust-and-stats';

beforeEach(() => { vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} }); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('hides online booking in both the desktop stats and mobile marquee when closed', () => {
  render(<TrustAndStats isBookingOpen={false} serviceCount={25} />);
  expect(screen.queryByText('Book Online')).toBeNull();
  expect(screen.queryByText('Online')).toBeNull();
  expect(screen.getAllByText('Dental Services')).toHaveLength(3);
});

it('shows online booking when requests are enabled', () => {
  render(<TrustAndStats isBookingOpen serviceCount={25} />);
  expect(screen.getAllByText('Book Online')).toHaveLength(3);
});
