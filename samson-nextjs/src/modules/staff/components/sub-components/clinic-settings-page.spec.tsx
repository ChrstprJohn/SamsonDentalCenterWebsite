/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ClinicSettingsPage } from './clinic-settings-page';
import { ClinicConfigForm } from './clinic-config-form';
import { DEFAULT_CONFIG } from '@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case';
import { updateClinicConfigAction } from '@/modules/clinic-config/actions/settings/update-clinic-config.action';

vi.mock('@/components/feedback/toast-container', () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock('@/modules/clinic-config/actions/settings/update-clinic-config.action', () => ({ updateClinicConfigAction: vi.fn() }));
vi.mock('@/modules/doctors/components/schedules/global-hours-tab', () => ({ GlobalHoursTab: () => null }));
vi.mock('@/modules/doctors/components/schedules/blocked-dates-panel', () => ({ BlockedDatesPanel: () => null }));
beforeEach(() => { vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

it.each([true, false])('saves a booking availability change from %s without a maintenance message', async (initialState) => {
  const initialConfig = { ...DEFAULT_CONFIG, isBookingOpen: initialState, maintenanceMessage: null };
  vi.mocked(updateClinicConfigAction).mockResolvedValue({ data: { ...initialConfig, isBookingOpen: !initialState } });
  const { container } = render(<ClinicSettingsPage initialConfig={initialConfig} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Booking settings' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Online booking enabled' }));
  expect(container.querySelector('textarea')).toBeNull();
  const button = screen.getByRole('button', { name: 'Save Booking Settings' });
  expect(button.closest('form')?.checkValidity()).toBe(true);
  fireEvent.click(button);
  await waitFor(() => expect(updateClinicConfigAction).toHaveBeenCalledWith({
    isBookingOpen: !initialState,
    allowSameDayBooking: initialConfig.allowSameDayBooking,
    calendarRenderDays: initialConfig.calendarRenderDays,
  }));
});

it('keeps the legacy admin form valid when booking is closed and no message exists', () => {
  const { container } = render(<ClinicConfigForm config={{ ...DEFAULT_CONFIG, isBookingOpen: false, maintenanceMessage: null }} setConfig={vi.fn()} isSavingConfig={false} handleConfigSave={vi.fn()} />);
  expect(container.querySelector('textarea')).toBeNull();
  expect(container.querySelector('form')?.checkValidity()).toBe(true);
});

it('keeps focus while editing a social platform and preserves its URL', () => {
  render(<ClinicSettingsPage initialConfig={{ ...DEFAULT_CONFIG, socialLinks: [{ platform: 'Facebook', url: 'https://example.com/profile' }] }} />);
  const platform = screen.getByLabelText('Social link 1 platform') as HTMLInputElement;
  platform.focus();
  fireEvent.change(platform, { target: { value: 'Instagram' } });
  expect(document.activeElement).toBe(platform);
  expect(platform.value).toBe('Instagram');
  expect((screen.getByLabelText('Social link 1 profile URL') as HTMLInputElement).value).toBe('https://example.com/profile');
});
