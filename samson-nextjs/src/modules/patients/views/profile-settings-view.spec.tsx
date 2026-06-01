/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileSettingsView } from './profile-settings-view';
import { useProfileSettingsView } from '../hooks/profile/use-profile-settings-view.hook';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../hooks/profile/use-profile-settings-view.hook', () => ({
  useProfileSettingsView: vi.fn(),
}));

vi.mock('../components/profile/profile-details-form', () => ({
  ProfileDetailsForm: () => <div data-testid="profile-details-form">Profile Details</div>,
}));

vi.mock('../components/profile/profile-preferences-form', () => ({
  ProfilePreferencesForm: () => <div data-testid="profile-preferences-form">Profile Preferences</div>,
}));

describe('ProfileSettingsView', () => {
  const initialUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    phone: '123',
    dob: '2000-01-01',
  };

  it('should render the view correctly', () => {
    (useProfileSettingsView as any).mockReturnValue({
      profileDetails: {},
      preferences: {},
      isSubmitting: false,
      handleProfileSubmit: vi.fn(),
    });

    render(<ProfileSettingsView initialUser={initialUser} />);

    expect(screen.getByText('Profile Settings')).toBeDefined();
    expect(screen.getByTestId('profile-details-form')).toBeDefined();
    expect(screen.getByTestId('profile-preferences-form')).toBeDefined();
  });
});
