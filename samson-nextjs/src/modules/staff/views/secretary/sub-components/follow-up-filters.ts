export const FOLLOW_UP_STAGES = ['ALL', 'ACTIVE', 'UNRESOLVED', 'WITH_DOCTOR', 'NO_ACTION_NEEDED', 'COMPLETED'] as const;
export const FOLLOW_UP_PERIODS = ['ALL', 'TODAY', 'WEEK', 'MONTH', 'RANGE'] as const;
export type FollowUpFilters = {
  stage: typeof FOLLOW_UP_STAGES[number];
  period: typeof FOLLOW_UP_PERIODS[number];
  dateField: 'REPORTED' | 'UPDATED';
  from: string;
  to: string;
};
export const DEFAULT_FOLLOW_UP_FILTERS: FollowUpFilters = { stage: 'ALL', period: 'ALL', dateField: 'REPORTED', from: '', to: '' };

export function validFollowUpDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseFollowUpFilters(params: Record<string, string | string[] | undefined>): FollowUpFilters {
  const stage = FOLLOW_UP_STAGES.find(value => value === params.stage) ?? 'ALL';
  let period = FOLLOW_UP_PERIODS.find(value => value === params.period) ?? 'ALL';
  const from = typeof params.from === 'string' && validFollowUpDate(params.from) ? params.from : '';
  const to = typeof params.to === 'string' && validFollowUpDate(params.to) ? params.to : '';
  if (period === 'RANGE' && (!from || !to || from > to)) period = 'ALL';
  return { stage, period, dateField: params.dateField === 'UPDATED' ? 'UPDATED' : 'REPORTED', from, to };
}

function offsetDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function followUpDateRange(filters: FollowUpFilters, now = new Date()) {
  if (filters.period === 'ALL') return null;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const from = filters.period === 'RANGE' ? filters.from : filters.period === 'WEEK' ? offsetDate(today, -6) : filters.period === 'MONTH' ? `${today.slice(0, 7)}-01` : today;
  const to = filters.period === 'RANGE' ? filters.to : today;
  if (!validFollowUpDate(from) || !validFollowUpDate(to) || from > to) return null;
  return { from: `${from}T00:00:00+08:00`, to: `${offsetDate(to, 1)}T00:00:00+08:00` };
}

export function followUpStatuses(stage: FollowUpFilters['stage']) {
  if (stage === 'ALL') return null;
  return stage === 'ACTIVE' ? ['UNRESOLVED', 'WITH_DOCTOR'] : [stage];
}

export function matchesFollowUpFilters(row: { status: string; createdAt: string; updatedAt: string | null }, filters: FollowUpFilters, now = new Date()) {
  const statuses = followUpStatuses(filters.stage);
  if (statuses && !statuses.includes(row.status)) return false;
  const range = followUpDateRange(filters, now);
  if (!range) return true;
  const value = filters.dateField === 'UPDATED' ? row.updatedAt : row.createdAt;
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= new Date(range.from).getTime() && time < new Date(range.to).getTime();
}
