'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import type { AuthHeaderUser } from '../../hooks/auth/header/use-auth-header.hook';
import { useAuthHeader } from '../../hooks/auth/header/use-auth-header.hook';
import { useClickOutside } from '@/shared/hooks/use-click-outside';
import { NotificationIndicator } from './notification-indicator';

interface AuthenticatedUserHeaderProps {
  user: AuthHeaderUser;
  notificationCount?: number;
}

const NAV_LINKS = [
  { href: '/user', label: 'My Portal', icon: '🏠' },
  { href: '/user/appointments', label: 'My Appointments', icon: '🗓️' },
  { href: '/user/settings', label: 'Settings', icon: '⚙️' },
] as const;

export function AuthenticatedUserHeader({
  user,
  notificationCount = 0,
}: AuthenticatedUserHeaderProps) {
  const { isDropdownOpen, toggleDropdown, closeDropdown, getInitials, logout, isLoading } = useAuthHeader();
  const initials = getInitials(user);
  const displayName = `${user.firstName} ${user.lastName}`.trim();

  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, closeDropdown);

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      {/* Notification Bell */}
      <NotificationIndicator
        count={notificationCount}
        onClick={() => {
          /* future: open notification panel */
        }}
      />

      {/* Avatar + Dropdown Trigger */}
      <div className="relative">
        <button
          id="user-avatar-btn"
          aria-label="Open user menu"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          onClick={toggleDropdown}
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 cursor-pointer group"
        >
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20">
              {initials}
            </div>
          )}

          {/* Name */}
          <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {displayName}
          </span>

          {/* Chevron */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            role="menu"
            aria-label="User navigation menu"
            className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200/80 dark:border-white/8 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/6">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {user.email}
              </p>
            </div>

            {/* Navigation links */}
            <div className="py-1.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={closeDropdown}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-slate-100 dark:border-white/6 py-1.5">
              <button
                role="menuitem"
                id="sign-out-btn"
                disabled={isLoading}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/8 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                onClick={logout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
