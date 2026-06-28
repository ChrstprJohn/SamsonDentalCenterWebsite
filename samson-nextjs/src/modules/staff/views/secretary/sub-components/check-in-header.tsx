'use client';

export function CheckInHeader({ todayStr, stats }: { todayStr: string; stats: any }) {
  const cards = [
    ['Checked In', stats.totalCheckedInToday, 'text-indigo-500'],
    ['Pending Out', stats.pendingCheckout, 'text-amber-500'],
    ['Completed', stats.completedToday, 'text-emerald-500'],
    ['Revenue Today', `PHP ${stats.totalRevenue.toLocaleString()}`, 'text-primary-start'],
  ];

  return (
    <div className="relative overflow-hidden bg-card/65 backdrop-blur-md border border-card-border/60 rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" /><h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight">Patient Flows</h1></div>
        <p className="text-xs text-text-muted">Operation desk & invoicing board for today: <strong className="text-text-secondary">{todayStr}</strong></p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
        {cards.map(([label, value, color]) => <div key={label} className="bg-secondary-bg/40 border border-card-border/30 rounded-2xl px-4 py-2.5 flex flex-col gap-0.5"><span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</span><span className={`text-lg font-black ${color}`}>{value}</span></div>)}
      </div>
    </div>
  );
}
