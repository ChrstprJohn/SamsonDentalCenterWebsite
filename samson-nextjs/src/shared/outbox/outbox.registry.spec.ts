import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerSubscriber, getSubscribers, clearRegistry } from './outbox.registry';

describe('outbox.registry', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('registers and retrieves subscriber functions', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    registerSubscriber('TEST_EVENT', handler1);
    registerSubscriber('TEST_EVENT', handler2);

    const subscribers = getSubscribers('TEST_EVENT');
    expect(subscribers).toHaveLength(2);
    expect(subscribers).toContain(handler1);
    expect(subscribers).toContain(handler2);
  });

  it('prevents registering duplicate handlers for the same event type', () => {
    const handler = vi.fn();

    registerSubscriber('TEST_EVENT', handler);
    registerSubscriber('TEST_EVENT', handler);

    const subscribers = getSubscribers('TEST_EVENT');
    expect(subscribers).toHaveLength(1);
    expect(subscribers[0]).toBe(handler);
  });

  it('returns empty array if no subscribers are registered for event type', () => {
    const subscribers = getSubscribers('NON_EXISTENT_EVENT');
    expect(subscribers).toEqual([]);
  });

  it('clears the entire registry', () => {
    const handler = vi.fn();
    registerSubscriber('EVENT_A', handler);
    registerSubscriber('EVENT_B', handler);

    clearRegistry();

    expect(getSubscribers('EVENT_A')).toEqual([]);
    expect(getSubscribers('EVENT_B')).toEqual([]);
  });
});
