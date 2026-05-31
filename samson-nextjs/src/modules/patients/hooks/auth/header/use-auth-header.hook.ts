'use client';

import { useState } from 'react';

export interface AuthHeaderUser {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
}

interface UseAuthHeaderReturn {
  isDropdownOpen: boolean;
  openDropdown: () => void;
  closeDropdown: () => void;
  toggleDropdown: () => void;
  getInitials: (user: AuthHeaderUser) => string;
}

export function useAuthHeader(): UseAuthHeaderReturn {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDropdown = () => setIsDropdownOpen(true);
  const closeDropdown = () => setIsDropdownOpen(false);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const getInitials = (user: AuthHeaderUser): string => {
    const first = user.firstName?.charAt(0)?.toUpperCase() ?? '';
    const last = user.lastName?.charAt(0)?.toUpperCase() ?? '';
    return `${first}${last}`;
  };

  return {
    isDropdownOpen,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    getInitials,
  };
}
