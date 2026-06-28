/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { checkInAction } from '@/modules/appointments/actions/status/check-in.action';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getInvoicesAction } from '@/modules/billing/actions/invoicing/get-invoices.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { useSecretaryCheckInOutTracker } from './use-secretary-check-in-out-tracker';

vi.mock('@/modules/appointments/actions/clinic/get-clinic-appointments.action', () => ({
  getClinicAppointmentsAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/check-in.action', () => ({
  checkInAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/undo-check-in.action', () => ({
  undoCheckInAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/mark-no-show.action', () => ({
  markNoShowAction: vi.fn(),
}));
vi.mock('@/modules/appointments/actions/status/update-appointment-status.action', () => ({
  updateAppointmentStatusAction: vi.fn(),
}));
vi.mock('@/modules/billing/actions/invoicing/checkout.action', () => ({
  checkoutAction: vi.fn(),
}));
vi.mock('@/modules/billing/actions/invoicing/get-invoices.action', () => ({
  getInvoicesAction: vi.fn(),
}));
vi.mock('@/modules/services/actions/management/get-services.action', () => ({
  getServicesAction: vi.fn(),
}));
vi.mock('@/shared/database/client', () => ({
  createClient: () => ({
    channel: () => ({
      on: () => ({
        on: () => ({
          subscribe: () => ({ id: 'channel' }),
        }),
      }),
    }),
    removeChannel: vi.fn(),
    from: () => ({ select: () => ({ eq: vi.fn().mockResolvedValue({ data: [] }) }) }),
  }),
}));
vi.mock('@/shared/utils/date.util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/utils/date.util')>();
  return { ...actual, getTodayLocalDateStr: () => '2026-07-10' };
});

describe('useSecretaryCheckInOutTracker', () => {
  it('loads today board data and delegates check-in payload', async () => {
    vi.mocked(getClinicAppointmentsAction).mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(getInvoicesAction).mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(getServicesAction).mockResolvedValue({ success: true, data: [] } as any);
    vi.mocked(checkInAction).mockResolvedValue({ success: true } as any);

    const { result } = renderHook(() => useSecretaryCheckInOutTracker());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.handleCheckIn('appt-1'));
    await waitFor(() => expect(checkInAction).toHaveBeenCalledWith({ appointmentId: 'appt-1' }));
    expect(getClinicAppointmentsAction).toHaveBeenCalledWith({ date: '2026-07-10' });
  });
});
