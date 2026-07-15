'use client';

import { useState } from 'react';
import { sendMessageAction } from '@/modules/appointments/actions/chat/send-message.action';

export type IntakeWorkflowState = 'SELECT_OPTION' | 'RESCHEDULE' | 'CANCEL' | 'NONE';

interface UseChatIntakeProps {
  appointmentId: string;
  chatToken?: string;
  onPatientMessageSent: (text: string) => Promise<void>;
}

export function useChatIntake({ appointmentId, chatToken, onPatientMessageSent }: UseChatIntakeProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<IntakeWorkflowState>('SELECT_OPTION');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [reasonText, setReasonText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetIntake = () => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedEndTime('');
    setReasonText('');
    setQuestionText('');
    setError(null);
  };

  const handleSystemAutoReply = async () => {
    try {
      // System auto-reply bypass payload
      await sendMessageAction({
        appointmentId,
        message: 'Got it. The clinic will review this and reply here shortly.',
        senderRole: 'STAFF',
        senderName: 'System',
        chatToken,
      });
    } catch (err) {
      console.error('Failed to post system auto-reply message:', err);
    }
  };

  const submitReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time slot.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // 1. Format date & time nicely
      const dateObj = new Date(`${selectedDate}T${selectedTime}`);
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const requestText = `I would like to request a reschedule for my appointment to ${dateStr} at ${timeStr}.`;

      // 2. Patient message
      await onPatientMessageSent(requestText);

      // 3. System auto-reply
      await handleSystemAutoReply();

      resetIntake();
      setActiveWorkflow('NONE');
    } catch (err: any) {
      setError(err.message || 'Reschedule request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCancellation = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const reasonSuffix = reasonText.trim() ? ` Reason: "${reasonText.trim()}"` : '';
      const requestText = `I would like to request a cancellation for this appointment.${reasonSuffix}`;

      // 2. Patient message
      await onPatientMessageSent(requestText);

      // 3. System auto-reply
      await handleSystemAutoReply();

      resetIntake();
      setActiveWorkflow('NONE');
    } catch (err: any) {
      setError(err.message || 'Cancellation request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitQuestion = async () => {
    if (!questionText.trim()) {
      setError('Please type your question.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      // 2. Patient message
      await onPatientMessageSent(questionText.trim());

      // 3. System auto-reply
      await handleSystemAutoReply();

      resetIntake();
      setActiveWorkflow('NONE');
    } catch (err: any) {
      setError(err.message || 'Question submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeWorkflow,
    setActiveWorkflow,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedEndTime,
    setSelectedEndTime,
    reasonText,
    setReasonText,
    questionText,
    setQuestionText,
    isSubmitting,
    error,
    resetIntake,
    submitReschedule,
    submitCancellation,
    submitQuestion,
  };
}
