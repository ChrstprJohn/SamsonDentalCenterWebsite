'use client';

interface FilterOption {
  id: string;
  label: string;
}

type TabType = 'upcoming' | 'pending' | 'history';

interface PatientAppointmentsTabsProps {
  activeTab: TabType;
  scheduledCount: number;
  pendingCount: number;
  historyCount: number;
  filterValue: string;
  filterOptions: FilterOption[];
  onTabChange: (tab: TabType) => void;
  onFilterChange: (value: string) => void;
}

const TABS: Array<{ id: TabType; label: string; activeClass: string; badgeClass: string }> = [
  { id: 'upcoming', label: 'Upcoming', activeClass: 'bg-blue-500 rounded-full', badgeClass: 'bg-blue-500 text-white' },
  { id: 'pending', label: 'Pending Requests', activeClass: 'bg-amber-500 rounded-full', badgeClass: 'bg-amber-500 text-white' },
  { id: 'history', label: 'History', activeClass: 'bg-slate-500 dark:bg-slate-400 rounded-full', badgeClass: 'bg-slate-500 text-white' },
];

export function PatientAppointmentsTabs({
  activeTab,
  scheduledCount,
  pendingCount,
  historyCount,
  filterValue,
  filterOptions,
  onTabChange,
  onFilterChange,
}: PatientAppointmentsTabsProps) {
  const counts = { upcoming: scheduledCount, pending: pendingCount, history: historyCount };

  return (
    <div className="flex flex-col md:flex-row md:justify-between border-b border-slate-200 dark:border-white/10 gap-4 md:gap-6">
      <div className="flex gap-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3.5 px-1 relative text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === tab.id ? tab.badgeClass : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {counts[tab.id]}
            </span>
            {activeTab === tab.id && <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.activeClass}`} />}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pb-2 md:pb-0 shrink-0">
        <label htmlFor="patient-filter" className="text-xs font-semibold text-slate-500">Filter:</label>
        <select
          id="patient-filter"
          value={filterValue}
          onChange={(event) => onFilterChange(event.target.value)}
          className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        >
          {filterOptions.map((option) => (
            <option key={option.id} value={option.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
