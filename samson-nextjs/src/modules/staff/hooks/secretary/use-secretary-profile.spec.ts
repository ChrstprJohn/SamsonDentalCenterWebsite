/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSecretaryProfile } from './use-secretary-profile';

describe('useSecretaryProfile', () => {
  it('updates profile fields through a typed field updater', () => {
    const { result } = renderHook(() => useSecretaryProfile());

    act(() => result.current.updateProfileField('firstName', 'Martha'));

    expect(result.current.profileForm.firstName).toBe('Martha');
  });
});
