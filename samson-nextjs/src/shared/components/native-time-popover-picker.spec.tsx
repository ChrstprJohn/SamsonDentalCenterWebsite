// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { NativeTimePopoverPicker } from './native-time-popover-picker';

describe('NativeTimePopoverPicker', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders trigger input and opens popover on click', () => {
    const handleChange = vi.fn();
    render(
      <NativeTimePopoverPicker
        value="09:00"
        onChange={handleChange}
        minTime="08:00"
        maxTime="17:00"
        unavailableRanges={[{ start: '12:00', end: '13:00' }]}
      />
    );

    const trigger = screen.getByText('09:00 AM');
    expect(trigger).toBeTruthy();

    fireEvent.click(trigger);
    const buttons = screen.getAllByRole('button', { name: '09' });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('filters out hours outside minTime and maxTime', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <NativeTimePopoverPicker
        value=""
        onChange={handleChange}
        minTime="09:00"
        maxTime="12:00"
      />
    );

    const trigger = screen.getByText('Select Preferred Time...');
    fireEvent.click(trigger);

    // Get hour column buttons (first list container)
    const hourCol = container.querySelectorAll('div[data-lenis-prevent="true"]')[0];
    const hours = Array.from(hourCol.querySelectorAll('button')).map((b) => b.textContent?.trim());
    expect(hours).not.toContain('08');
    expect(hours).toContain('09');
    expect(hours).toContain('10');
    expect(hours).toContain('11');
  });

  it('shows boundary hours at break/close edges with only :00 minute pickable', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <NativeTimePopoverPicker
        value="09:00"
        onChange={handleChange}
        minTime="08:00"
        maxTime="17:00"
        unavailableRanges={[{ start: '12:00', end: '13:00' }]}
      />
    );

    const trigger = screen.getByText('09:00 AM');
    fireEvent.click(trigger);

    const hourCol = container.querySelectorAll('div[data-lenis-prevent="true"]')[0];
    const hours = Array.from(hourCol.querySelectorAll('button')).map((b) => b.textContent?.trim());
    // 12 PM is break-start boundary -> hour shows, only :00 minute is pickable
    expect(hours).toContain('12');
  });

  it('allows only the :00 minute on boundary hours', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <NativeTimePopoverPicker
        value=""
        onChange={handleChange}
        minTime="08:00"
        maxTime="17:00"
        unavailableRanges={[{ start: '12:00', end: '13:00' }]}
      />
    );

    const trigger = screen.getByText('Select Preferred Time...');
    fireEvent.click(trigger);

    // Hour column has 12 (break boundary) and 05 (close boundary)
    const hourCol = container.querySelectorAll('div[data-lenis-prevent="true"]')[0];
    const hours = Array.from(hourCol.querySelectorAll('button')).map((b) => b.textContent?.trim());
    expect(hours).toContain('12');
    expect(hours).toContain('05');

    // Pick 12 -> minute column shows only '00'
    const hourButtons = Array.from(hourCol.querySelectorAll('button')) as HTMLButtonElement[];
    fireEvent.click(hourButtons.find((b) => b.textContent?.trim() === '12')!);

    const minuteCol = container.querySelectorAll('div[data-lenis-prevent="true"]')[1];
    const minutes = Array.from(minuteCol.querySelectorAll('button')).map((b) => b.textContent?.trim());
    expect(minutes).toEqual(['00']);
  });
});


