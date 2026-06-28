'use client';

import Link from 'next/link';
import { CalendarDays, Home, LogOut, Settings } from 'lucide-react';
import type { AuthHeaderUser } from '../../../hooks/auth/header/use-auth-header';

const NAV_LINKS = [
  { href: '/user', label: 'My Portal', Icon: Home },
  { href: '/user/appointments', label: 'My Appointments', Icon: CalendarDays },
  { href: '/user/settings', label: 'Settings', Icon: Settings },
] as const;

interface AuthUserMenuProps {
  user: AuthHeaderUser;
  displayName: string;
  isLoading: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function AuthUserMenu({ user, displayName, isLoading, onClose, onLogout }: AuthUserMenuProps) {
  return (
    <div
      role="menu"
      aria-label="User navigation menu"
      className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200/80 dark:border-white/8 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/6">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
      </div>

      <div className="py-1.5">
        {NAV_LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            role="menuitem"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      <div className="border-t border-slate-100 dark:border-white/6 py-1.5">
        <button
          role="menuitem"
          id="sign-out-btn"
          disabled={isLoading}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/8 transition-colors duration-150 cursor-pointer disabled:opacity-50"
          onClick={onLogout}
        >
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
