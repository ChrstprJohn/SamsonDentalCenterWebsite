/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStaffLoginForm } from './use-staff-login-form';

describe('useStaffLoginForm', () => {
  it('initializes with empty login credentials', () => {
    const { result } = renderHook(() => useStaffLoginForm());

    expect(result.current.getValues()).toEqual({ email: '', password: '' });
  });
});
