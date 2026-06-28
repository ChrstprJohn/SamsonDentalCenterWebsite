export type OutboxSubscriberFn = (payload: any) => Promise<void>;

const registry: Record<string, OutboxSubscriberFn[]> = {};

/**
 * Registers a subscriber function to a specific event type.
 */
export const registerSubscriber = (eventType: string, handler: OutboxSubscriberFn) => {
  if (!registry[eventType]) {
    registry[eventType] = [];
  }
  // Prevent duplicate registrations in hot-reloading dev environments
  if (!registry[eventType].includes(handler)) {
    registry[eventType].push(handler);
  }
};

/**
 * Retrieves all registered subscribers for a given event type.
 */
export const getSubscribers = (eventType: string): OutboxSubscriberFn[] => {
  return registry[eventType] || [];
};

/**
 * Clears the registry (useful for testing)
 */
export const clearRegistry = () => {
  for (const key in registry) {
    delete registry[key];
  }
};
