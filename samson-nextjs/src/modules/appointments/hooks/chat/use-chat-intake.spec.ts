/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useChatIntake } from './use-chat-intake';
import { sendMessageAction } from '@/modules/appointments/actions/chat/send-message.action';

vi.mock('@/modules/appointments/actions/chat/send-message.action', () => ({
  sendMessageAction: vi.fn(),
}));

describe('useChatIntake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const onPatientMessageSent = vi.fn();
    const { result } = renderHook(() =>
      useChatIntake({
        appointmentId: 'appt-123',
        chatToken: 'token-456',
        onPatientMessageSent,
      })
    );

    expect(result.current.activeWorkflow).toBe('SELECT_OPTION');
    expect(result.current.selectedDate).toBe('');
    expect(result.current.selectedTime).toBe('');
    expect(result.current.reasonText).toBe('');
    expect(result.current.questionText).toBe('');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles reschedule submission and system auto-reply', async () => {
    const onPatientMessageSent = vi.fn().mockResolvedValue(undefined);
    vi.mocked(sendMessageAction).mockResolvedValue({ success: true } as any);

    const { result } = renderHook(() =>
      useChatIntake({
        appointmentId: 'appt-123',
        chatToken: 'token-456',
        onPatientMessageSent,
      })
    );

    // Set fields
    act(() => {
      result.current.setSelectedDate('2026-07-20');
      result.current.setSelectedTime('10:00:00');
    });

    await act(async () => {
      await result.current.submitReschedule();
    });

    expect(onPatientMessageSent).toHaveBeenCalledWith(
      expect.stringContaining(`I would like to request a reschedule for my appointment:
New Date: Jul 20, 2026
Preferred Time: 10:00 AM`)
    );
    expect(sendMessageAction).toHaveBeenCalledWith(
      {
        appointmentId: 'appt-123',
        message: 'Your request to reschedule has been submitted to the clinic staff. We will reply to this chat as soon as we have confirmed the new date and time.',
        senderRole: 'STAFF',
        senderName: 'System',
      },
      'token-456'
    );
    expect(result.current.activeWorkflow).toBe('NONE');
  });

  it('handles cancellation request and system auto-reply', async () => {
    const onPatientMessageSent = vi.fn().mockResolvedValue(undefined);
    vi.mocked(sendMessageAction).mockResolvedValue({ success: true } as any);

    const { result } = renderHook(() =>
      useChatIntake({
        appointmentId: 'appt-123',
        chatToken: 'token-456',
        onPatientMessageSent,
      })
    );

    act(() => {
      result.current.setReasonText('Feeling sick');
    });

    await act(async () => {
      await result.current.submitCancellation();
    });

    expect(onPatientMessageSent).toHaveBeenCalledWith(
      `I would like to request a cancellation for this appointment.
Reason: Feeling sick`
    );
    expect(sendMessageAction).toHaveBeenCalled();
    expect(result.current.activeWorkflow).toBe('NONE');
  });

  it('handles question request and system auto-reply', async () => {
    const onPatientMessageSent = vi.fn().mockResolvedValue(undefined);
    vi.mocked(sendMessageAction).mockResolvedValue({ success: true } as any);

    const { result } = renderHook(() =>
      useChatIntake({
        appointmentId: 'appt-123',
        chatToken: 'token-456',
        onPatientMessageSent,
      })
    );

    act(() => {
      result.current.setQuestionText('Do you accept insurance?');
    });

    await act(async () => {
      await result.current.submitQuestion();
    });

    expect(onPatientMessageSent).toHaveBeenCalledWith('Do you accept insurance?');
    expect(sendMessageAction).toHaveBeenCalled();
    expect(result.current.activeWorkflow).toBe('NONE');
  });
});
