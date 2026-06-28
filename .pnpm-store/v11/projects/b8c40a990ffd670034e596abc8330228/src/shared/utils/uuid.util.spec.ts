import { describe, it, expect } from 'vitest';
import { generateId } from './uuid.util';

describe('UUID Utility', () => {
  it('should generate a valid UUID string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(36); // UUIDs are 36 characters long
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});
