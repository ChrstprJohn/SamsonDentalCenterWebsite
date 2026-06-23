'use client';

import React from 'react';

interface NotificationIndicatorProps {
  count: number;
  onClick?: () => void;
  isDarkNav?: boolean;
}

export function NotificationIndicator({ count, onClick, isDarkNav = false }: NotificationIndicatorProps) {
  const displayCount = count > 99 ? '99+' : count;
  const hasNotifications = count > 0;

  return (
    <button
      id="notification-bell-btn"
      aria-label={`Notifications${hasNotifications ? `, ${displayCount} unread` : ''}`}
      onClick={onClick}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 cursor-pointer ${
        isDarkNav
          ? 'text-white/85 hover:text-white hover:bg-white/10'
          : 'text-[#1D1E1E]/75 hover:text-[#D94E4E] hover:bg-[#1D1E1E]/5'
      }`}
    >
      {/* Bell SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* Badge */}
      {hasNotifications && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-[#D94E4E] to-[#f47c7c] text-white text-[9px] font-bold shadow-sm shadow-[#D94E4E]/30 animate-pulse"
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
