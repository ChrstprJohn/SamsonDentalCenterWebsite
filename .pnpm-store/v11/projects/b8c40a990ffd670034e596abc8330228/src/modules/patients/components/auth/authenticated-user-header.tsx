'use client';

import React, { useRef } from 'react';
import type { AuthHeaderUser } from '../../hooks/auth/header/use-auth-header';
import { useAuthHeader } from '../../hooks/auth/header/use-auth-header';
import { useClickOutside } from '@/shared/hooks/use-click-outside';
import { NotificationIndicator } from './notification-indicator';
import { AuthUserMenu } from './sub-components/auth-user-menu';

interface AuthenticatedUserHeaderProps {
  user: AuthHeaderUser;
  notificationCount?: number;
  isDarkNav?: boolean;
}

export function AuthenticatedUserHeader({
  user,
  notificationCount = 0,
  isDarkNav = false,
}: AuthenticatedUserHeaderProps) {
  const { isDropdownOpen, toggleDropdown, closeDropdown, getInitials, logout, isLoading } = useAuthHeader();
  const initials = getInitials(user);
  const displayName = `${user.firstName} ${user.lastName}`.trim();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, closeDropdown);

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      <NotificationIndicator count={notificationCount} isDarkNav={isDarkNav} onClick={() => undefined} />

      <div className="relative">
        <button
          id="user-avatar-btn"
          aria-label="Open user menu"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          onClick={toggleDropdown}
          className={`flex items-center gap-2.5 rounded-full px-2.5 py-1.5 transition-all duration-200 cursor-pointer group ${
            isDarkNav ? 'hover:bg-white/10' : 'hover:bg-[#1D1E1E]/5'
          }`}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-[#D94E4E]/20" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#D94E4E] flex items-center justify-center text-white text-[11px] font-bold shadow-md shadow-[#D94E4E]/10 ring-2 ring-[#D94E4E]/20">
              {initials}
            </div>
          )}

          <span className={`hidden sm:block font-sans text-[13px] tracking-[0.1em] font-semibold uppercase max-w-[120px] truncate transition-colors ${
            isDarkNav ? 'text-white/85 group-hover:text-white' : 'text-[#1D1E1E]/80 group-hover:text-[#D94E4E]'
          }`}>
            {user.firstName}
          </span>

          <span
            aria-hidden="true"
            className={`text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${
              isDarkNav ? 'text-white/60 group-hover:text-white' : 'text-[#1D1E1E]/60 group-hover:text-[#D94E4E]'
            }`}
          >
            v
          </span>
        </button>

        {isDropdownOpen && (
          <AuthUserMenu
            user={user}
            displayName={displayName}
            isLoading={isLoading}
            onClose={closeDropdown}
            onLogout={logout}
          />
        )}
      </div>
    </div>
  );
}
