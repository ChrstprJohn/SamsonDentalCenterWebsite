import { describe, it, expect, vi } from 'vitest';
import { useLoginForm } from './use-login-form';
import * as ReactHookForm from 'react-hook-form';

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: vi.fn(),
  };
});

describe('useLoginForm', () => {
  it('should initialize useForm with correct default values', () => {
    useLoginForm();
    expect(ReactHookForm.useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          email: '',
          password: '',
        },
      })
    );
  });
});
