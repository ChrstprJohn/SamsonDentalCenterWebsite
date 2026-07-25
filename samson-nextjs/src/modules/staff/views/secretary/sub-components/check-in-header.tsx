'use client';

export function CheckInHeader({ todayStr }: { todayStr: string }) {
  const formatted = todayStr
    ? new Date(todayStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="px-4 py-3 border-b border-border shrink-0">
      <h1 className="text-base font-medium text-foreground">Check-In & Out</h1>
      <p className="text-[11px] text-muted-foreground">{formatted}</p>
    </div>
  );
}
