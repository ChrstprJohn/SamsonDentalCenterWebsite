'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

const SIDEBAR_LINKS: SidebarLink[] = [
  { href: '/user', label: 'My Dashboard', icon: '📊' },
  { href: '/user/appointments', label: 'My Appointments', icon: '📅' },
  { href: '/user/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/user/settings', label: 'Account Settings', icon: '⚙️' },
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:col-span-3 flex flex-col gap-2">
      {SIDEBAR_LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg'
            }`}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </aside>
  );
}
