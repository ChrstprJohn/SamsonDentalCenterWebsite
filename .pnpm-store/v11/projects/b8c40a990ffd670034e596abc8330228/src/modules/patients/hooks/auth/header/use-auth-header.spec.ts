import { describe, it, expect } from 'vitest';
import type { AuthHeaderUser } from './use-auth-header';

// getInitials is pure logic extracted from the hook and testable without DOM.
// Dropdown toggle state (useState) is trivial UI state — exempt from unit tests per
// the Frontend Testing Guidelines (Section 1B: Simple prop-to-JSX / state does NOT
// need a .spec file unless logic is genuinely complex).

function getInitials(user: AuthHeaderUser): string {
  const first = user.firstName?.charAt(0)?.toUpperCase() ?? '';
  const last = user.lastName?.charAt(0)?.toUpperCase() ?? '';
  return `${first}${last}`;
}

describe('useAuthHeader — getInitials (pure logic)', () => {
  it('should return correct uppercase initials for a full name', () => {
    const result = getInitials({ firstName: 'John', lastName: 'Doe', email: 'j@d.com' });
    expect(result).toBe('JD');
  });

  it('should uppercase lowercase name inputs', () => {
    const result = getInitials({ firstName: 'alice', lastName: 'smith', email: 'a@s.com' });
    expect(result).toBe('AS');
  });

  it('should handle empty firstName gracefully', () => {
    const result = getInitials({ firstName: '', lastName: 'Doe', email: 'j@d.com' });
    expect(result).toBe('D');
  });

  it('should handle empty lastName gracefully', () => {
    const result = getInitials({ firstName: 'John', lastName: '', email: 'j@d.com' });
    expect(result).toBe('J');
  });

  it('should return empty string when both names are empty', () => {
    const result = getInitials({ firstName: '', lastName: '', email: 'j@d.com' });
    expect(result).toBe('');
  });
});
