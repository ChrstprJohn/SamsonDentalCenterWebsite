'use client';

export function CheckInLoading() {
  return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><div className="relative w-16 h-16"><div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" /><div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" /></div><div className="text-sm font-medium text-text-muted">Loading Patient Visits Board...</div></div>;
}
