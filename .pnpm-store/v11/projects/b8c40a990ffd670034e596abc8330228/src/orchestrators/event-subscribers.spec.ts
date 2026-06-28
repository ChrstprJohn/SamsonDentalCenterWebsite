import { describe, it, expect, vi } from 'vitest';

vi.mock('server-only', () => ({}));

// Mock the outbox registry
vi.mock('@/shared/outbox/outbox.registry', () => ({
  registerSubscriber: vi.fn(),
}));

// Mock onPatientRegisteredSubscriber
vi.mock('@/modules/emails/subscribers/on-patient-registered.subscriber', () => ({
  onPatientRegisteredSubscriber: {
    handle: vi.fn(),
  },
}));

import { bootstrapEventSubscribers } from './event-subscribers';
import { registerSubscriber } from '@/shared/outbox/outbox.registry';
import { onPatientRegisteredSubscriber } from '@/modules/emails/subscribers/on-patient-registered.subscriber';

describe('bootstrapEventSubscribers', () => {
  it('registers the patient registered subscriber', () => {
    bootstrapEventSubscribers();

    expect(registerSubscriber).toHaveBeenCalledWith(
      'PATIENT_REGISTERED',
      onPatientRegisteredSubscriber.handle
    );
  });
});
