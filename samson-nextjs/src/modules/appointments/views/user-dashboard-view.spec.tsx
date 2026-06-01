/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserDashboardView } from './user-dashboard-view';
import { useUserDashboard } from '../hooks/dashboard/use-user-dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../hooks/dashboard/use-user-dashboard', () => ({
  useUserDashboard: vi.fn(),
}));

vi.mock('../components/dashboard/upcoming-appointments', () => ({
  UpcomingAppointments: () => <div data-testid="upcoming-appointments">Upcoming</div>,
}));

vi.mock('../components/dashboard/pending-approvals', () => ({
  PendingApprovals: () => <div data-testid="pending-approvals">Pending</div>,
}));

vi.mock('../components/dashboard/appointment-history', () => ({
  AppointmentHistory: () => <div data-testid="appointment-history">History</div>,
}));

vi.mock('../components/dashboard/cancel-appointment-modal', () => ({
  CancelAppointmentModal: ({ isOpen }: any) => isOpen ? <div data-testid="cancel-modal">Cancel Modal</div> : null,
}));

vi.mock('../components/dashboard/reschedule-blocked-modal', () => ({
  RescheduleBlockedModal: ({ isOpen }: any) => isOpen ? <div data-testid="reschedule-modal">Reschedule Modal</div> : null,
}));

describe('UserDashboardView', () => {
  it('should render all dashboard sections and pass mocked state correctly', () => {
    (useUserDashboard as any).mockReturnValue({
      scheduled: [],
      pending: [],
      history: [],
      selectedAppt: null,
      isCancelModalOpen: false,
      cancelReason: '',
      isCancelling: false,
      blockedRescheduleAppt: null,
      handleRescheduleClick: vi.fn(),
      handleCancelClick: vi.fn(),
      handleCancelSubmit: vi.fn(),
      closeCancelModal: vi.fn(),
      setCancelReason: vi.fn(),
      setBlockedRescheduleAppt: vi.fn(),
    });

    render(<UserDashboardView initialAppointments={[]} maxReschedules={2} />);

    expect(screen.getByText('Patient Dashboard')).toBeDefined();
    expect(screen.getByTestId('upcoming-appointments')).toBeDefined();
    expect(screen.getByTestId('pending-approvals')).toBeDefined();
    expect(screen.getByTestId('appointment-history')).toBeDefined();
    expect(screen.queryByTestId('cancel-modal')).toBeNull();
    expect(screen.queryByTestId('reschedule-modal')).toBeNull();
  });

  it('should conditionally render modals based on orchestrator state', () => {
    (useUserDashboard as any).mockReturnValue({
      scheduled: [],
      pending: [],
      history: [],
      selectedAppt: null,
      isCancelModalOpen: true, // open cancel modal
      cancelReason: '',
      isCancelling: false,
      blockedRescheduleAppt: { id: 'test' }, // open reschedule modal
      handleRescheduleClick: vi.fn(),
      handleCancelClick: vi.fn(),
      handleCancelSubmit: vi.fn(),
      closeCancelModal: vi.fn(),
      setCancelReason: vi.fn(),
      setBlockedRescheduleAppt: vi.fn(),
    });

    render(<UserDashboardView initialAppointments={[]} maxReschedules={2} />);

    expect(screen.getByTestId('cancel-modal')).toBeDefined();
    expect(screen.getByTestId('reschedule-modal')).toBeDefined();
  });
});
