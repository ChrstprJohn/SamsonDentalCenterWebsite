/** @vitest-environment jsdom */
import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { FollowUpResponsesPanel, type FollowUpResponseRow } from './follow-up-responses-panel';
import { DEFAULT_FOLLOW_UP_FILTERS } from './follow-up-filters';
import { updateWellbeingStatusAction } from '@/modules/wellbeing/actions/update-wellbeing-status.action';
import { createManualWellbeingResponseAction } from '@/modules/wellbeing/actions/create-manual-wellbeing-response.action';

const mocks = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks, usePathname: () => '/secretary-v2/check-in/follow-up', useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/ui/sidebar', () => ({ SidebarTrigger: () => null }));
vi.mock('@/components/feedback/toast-container', () => ({ useToast: () => ({ addToast: mocks.toast }) }));
vi.mock('@/modules/wellbeing/actions/update-wellbeing-status.action', () => ({ updateWellbeingStatusAction: vi.fn() }));
vi.mock('@/modules/wellbeing/actions/create-manual-wellbeing-response.action', () => ({ createManualWellbeingResponseAction: vi.fn() }));

const row: FollowUpResponseRow = { id: '4d91ee34-2adb-456f-a0ac-d86b450868af', patientName: 'Test Patient', status: 'UNRESOLVED', feeling: 'NOT_SO_GOOD', createdAt: '2020-01-01T00:00:00Z', updatedAt: null, source: 'PHONE', note: 'Keep these notes', details: { symptoms: ['Pain'], callBack: 'YES' } };
beforeEach(() => vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} }));
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

it('shows resolved stage without presenting the original poor condition as an active alert', () => {
  render(<FollowUpResponsesPanel responses={[{ ...row, status: 'COMPLETED' }]} appointmentOptions={[]} />);
  const card = screen.getByRole('button', { name: 'Open follow-up for Test Patient' });
  expect(within(card).getByText('Cleared')).toBeTruthy();
  expect(within(card).getByText('Reported: Not Doing Well').parentElement?.className).toContain('text-muted-foreground');
  expect(screen.queryByText('1 follow-up')).toBeNull();
  fireEvent.click(card);
  const pane = screen.getByRole('complementary');
  expect(within(pane).getByText('Original patient report. This case is resolved; the report is kept for reference.')).toBeTruthy();
  expect(within(pane).getByText('Not Doing Well').parentElement?.className).toContain('bg-muted');
  expect(within(pane).queryByText('T')).toBeNull();
  expect(within(pane).getByRole('button', { name: 'Cleared' }).getAttribute('aria-pressed')).toBe('true');
});

it('updates the open pane and moves a case immediately after a successful save', async () => {
  vi.mocked(updateWellbeingStatusAction).mockResolvedValue({ success: true, data: { id: row.id, status: 'COMPLETED', updatedAt: '2026-10-14T00:00:00Z' } });
  render(<FollowUpResponsesPanel responses={[row]} appointmentOptions={[]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open follow-up for Test Patient' }));
  fireEvent.click(within(screen.getByRole('complementary')).getByRole('button', { name: 'Cleared' }));
  await waitFor(() => expect(within(screen.getByRole('region', { name: 'Resolved' })).getByRole('button', { name: 'Open follow-up for Test Patient' })).toBeTruthy());
  expect(within(screen.getByRole('complementary')).getByRole('button', { name: 'Cleared' }).getAttribute('aria-pressed')).toBe('true');
  expect(mocks.refresh).toHaveBeenCalled();
});

it('keeps the original stage when a save fails and allows another attempt', async () => {
  vi.mocked(updateWellbeingStatusAction).mockRejectedValue(new Error('Network'));
  render(<FollowUpResponsesPanel responses={[row]} appointmentOptions={[]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open follow-up for Test Patient' }));
  const button = within(screen.getByRole('complementary')).getByRole('button', { name: 'Cleared' }) as HTMLButtonElement;
  fireEvent.click(button);
  await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith('Unable to update the follow-up. Please try again.', 'error'));
  expect(button.disabled).toBe(false);
  expect(within(screen.getByRole('region', { name: 'Awaiting Review' })).getByRole('button', { name: 'Open follow-up for Test Patient' })).toBeTruthy();
});

it('applies cleared and custom date filters in the URL, then resets them', () => {
  const { container } = render(<FollowUpResponsesPanel responses={[row]} appointmentOptions={[]} />);
  const details = container.querySelector('details')!;
  details.open = true;
  fireEvent(details, new Event('toggle'));
  fireEvent.change(screen.getByLabelText('Stage'), { target: { value: 'COMPLETED' } });
  fireEvent.change(screen.getByLabelText('Period'), { target: { value: 'RANGE' } });
  fireEvent.change(screen.getByLabelText('Date to filter'), { target: { value: 'UPDATED' } });
  fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-10-01' } });
  fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-10-14' } });
  fireEvent.submit(screen.getByRole('form', { name: 'Follow-up filters' }));
  expect(mocks.replace).toHaveBeenCalledWith('/secretary-v2/check-in/follow-up?stage=COMPLETED&period=RANGE&dateField=UPDATED&from=2026-10-01&to=2026-10-14', { scroll: false });
  details.open = true;
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(mocks.replace).toHaveBeenLastCalledWith('/secretary-v2/check-in/follow-up', { scroll: false });
});

it('limits cleared cases while keeping manual entries on a failed submission', async () => {
  vi.mocked(createManualWellbeingResponseAction).mockResolvedValue({ success: false, error: 'Please retry' });
  render(<FollowUpResponsesPanel responses={[row, { ...row, id: 'second', status: 'COMPLETED', patientName: 'Cleared Patient' }]} appointmentOptions={[]} filters={{ ...DEFAULT_FOLLOW_UP_FILTERS, stage: 'COMPLETED' }} />);
  expect(screen.queryByRole('button', { name: 'Open follow-up for Test Patient' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Log Follow-Up' }));
  fireEvent.change(screen.getByLabelText('Patient Name'), { target: { value: '  New Patient  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Feeling Great' }));
  fireEvent.change(screen.getByLabelText('Secretary Notes'), { target: { value: 'Follow up next week' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Follow-Up' }));
  await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith('Please retry', 'error'));
  expect(createManualWellbeingResponseAction).toHaveBeenCalledWith({ appointmentId: undefined, patientName: 'New Patient', feeling: 'FEELING_GREAT', note: 'Follow up next week', symptoms: undefined, source: 'PHONE' });
  expect((screen.getByLabelText('Secretary Notes') as HTMLTextAreaElement).value).toBe('Follow up next week');
});
