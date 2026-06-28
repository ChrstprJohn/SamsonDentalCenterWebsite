/**
 * Generates a unique UUID safely in both Node.js and Browser environments.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
