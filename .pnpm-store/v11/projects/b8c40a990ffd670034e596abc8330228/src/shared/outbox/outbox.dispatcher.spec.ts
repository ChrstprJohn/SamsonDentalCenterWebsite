import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalOutboxDispatcher } from './outbox.dispatcher';
import { outboxCommands } from './outbox.commands';
import { registerSubscriber, clearRegistry } from './outbox.registry';

vi.mock('./outbox.commands');

describe('GlobalOutboxDispatcher', () => {
  const mockSupabaseAdmin = {} as any;
  let mockClaimPendingEvents: any;
  let mockMarkAsProcessed: any;
  let mockMarkAsFailed: any;

  beforeEach(() => {
    vi.clearAllMocks();
    clearRegistry();

    mockClaimPendingEvents = vi.fn();
    mockMarkAsProcessed = vi.fn();
    mockMarkAsFailed = vi.fn();

    vi.mocked(outboxCommands).mockReturnValue({
      claimPendingEvents: mockClaimPendingEvents,
      markAsProcessed: mockMarkAsProcessed,
      markAsFailed: mockMarkAsFailed,
      emitEvent: vi.fn(),
    });
  });

  it('claims events and processes them via registered subscribers', async () => {
    // Arrange
    const mockSubscriber = vi.fn().mockResolvedValue(undefined);
    registerSubscriber('TEST_EVENT', mockSubscriber);

    mockClaimPendingEvents.mockResolvedValue([
      { id: 'event_1', event_type: 'TEST_EVENT', payload: { foo: 'bar' } }
    ]);

    const dispatch = globalOutboxDispatcher(mockSupabaseAdmin);

    // Act
    await dispatch();

    // Assert
    expect(mockClaimPendingEvents).toHaveBeenCalledWith(10);
    expect(mockSubscriber).toHaveBeenCalledWith({ foo: 'bar' });
    expect(mockMarkAsProcessed).toHaveBeenCalledWith('event_1');
    expect(mockMarkAsFailed).not.toHaveBeenCalled();
  });

  it('marks event as processed if there are no subscribers (benign)', async () => {
    // Arrange
    mockClaimPendingEvents.mockResolvedValue([
      { id: 'event_2', event_type: 'UNKNOWN_EVENT', payload: {} }
    ]);

    const dispatch = globalOutboxDispatcher(mockSupabaseAdmin);

    // Act
    await dispatch();

    // Assert
    expect(mockMarkAsProcessed).toHaveBeenCalledWith('event_2');
    expect(mockMarkAsFailed).not.toHaveBeenCalled();
  });

  it('catches subscriber errors and marks event as failed', async () => {
    // Arrange
    const mockSubscriber = vi.fn().mockRejectedValue(new Error('Resend API down'));
    registerSubscriber('TEST_EVENT', mockSubscriber);

    mockClaimPendingEvents.mockResolvedValue([
      { id: 'event_3', event_type: 'TEST_EVENT', payload: {} }
    ]);

    const dispatch = globalOutboxDispatcher(mockSupabaseAdmin);

    // Act
    await dispatch();

    // Assert
    expect(mockSubscriber).toHaveBeenCalled();
    expect(mockMarkAsProcessed).not.toHaveBeenCalled();
    expect(mockMarkAsFailed).toHaveBeenCalledWith('event_3', 'Resend API down');
  });
});
