'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import { logoutAction } from '../../../actions/auth/logout.action';

export interface AuthHeaderUser {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
}

interface UseAuthHeaderReturn {
  isDropdownOpen: boolean;
  isLoading: boolean;
  openDropdown: () => void;
  closeDropdown: () => void;
  toggleDropdown: () => void;
  getInitials: (user: AuthHeaderUser) => string;
  logout: () => Promise<void>;
}

export function useAuthHeader(): UseAuthHeaderReturn {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const openDropdown = () => setIsDropdownOpen(true);
  const closeDropdown = () => setIsDropdownOpen(false);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const getInitials = (user: AuthHeaderUser): string => {
    const first = user.firstName?.charAt(0)?.toUpperCase() ?? '';
    const last = user.lastName?.charAt(0)?.toUpperCase() ?? '';
    return `${first}${last}`;
  };

  const logout = async () => {
    setIsLoading(true);
    closeDropdown();
    try {
      const res = await logoutAction();
      if (res.success) {
        addToast('Logged out successfully', 'success');
        router.refresh();
        router.push('/');
      } else {
        addToast(res.error || 'Failed to sign out', 'error');
      }
    } catch (err) {
      console.error('Logout error:', err);
      addToast('An unexpected error occurred during logout', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isDropdownOpen,
    isLoading,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    getInitials,
    logout,
  };
}
