// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDoctorForm } from './use-doctor-form';
import { doctorFormSchema } from './use-doctor-form-schema';

vi.mock('../actions/create-doctor.action', () => ({
  createDoctorAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
}));

vi.mock('../actions/update-doctor.action', () => ({
  updateDoctorAction: vi.fn().mockResolvedValue({ success: true, data: { id: '1' } }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({
    addToast: vi.fn(),
  }),
}));

describe('useDoctorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDoctorForm());
    expect(result.current.form.getValues().firstName).toBe('');
    expect(result.current.form.getValues().defaultPassword).toBe('Welcome@Samson2026');
    expect(result.current.form.getValues().status).toBe('ACTIVE');
  });

  it('status schema accepts ACTIVE, HIDDEN, ARCHIVED', () => {
    expect(doctorFormSchema.shape.status.parse('ACTIVE')).toBe('ACTIVE');
    expect(doctorFormSchema.shape.status.parse('HIDDEN')).toBe('HIDDEN');
    expect(doctorFormSchema.shape.status.parse('ARCHIVED')).toBe('ARCHIVED');
    expect(() => doctorFormSchema.shape.status.parse('INVALID')).toThrow();
  });
});
