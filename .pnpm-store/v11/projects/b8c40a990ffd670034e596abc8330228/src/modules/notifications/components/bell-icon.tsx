import { Bell } from 'lucide-react';

interface BellIconProps {
  unreadCount: number;
}

export function BellIcon({ unreadCount }: BellIconProps) {
  return (
    <div className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors duration-200 cursor-pointer">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
}
