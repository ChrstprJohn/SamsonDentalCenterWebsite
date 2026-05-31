import { describe, it, expect, vi } from 'vitest';
import { useSignUpForm } from './use-sign-up-form.hook';
import * as ReactHookForm from 'react-hook-form';

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: vi.fn(),
  };
});

describe('useSignUpForm', () => {
  it('should initialize useForm with correct default values', () => {
    useSignUpForm();
    expect(ReactHookForm.useForm).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultValues: {
          firstName: '',
          middleName: '',
          lastName: '',
          suffix: '',
          email: '',
          phoneNumber: '',
          dateOfBirth: '',
          password: '',
          confirmPassword: '',
        },
      })
    );
  });
});
