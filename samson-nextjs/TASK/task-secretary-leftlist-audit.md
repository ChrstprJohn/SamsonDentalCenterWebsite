# Left-Side List Panel Audit
> Pages: Chat Inbox · Appointments Directory · Unresolved Appointments · Communication History (Email & SMS) · Appointment Requests
> Focus: Loading states, pagination, Show More bugs, stale data, tab/page-change behavior, fetch patterns

---

## Summary Matrix

| Page | Loading State | Show More / Pagination | Stale Data | Tab-change Bugs | Selection on Refetch |
|---|---|---|---|---|---|
| **Chat Inbox** | ✅ Skeleton (good) | ⚠️ Show More bug (3 problems) | ⚠️ Status changes not realtime | ✅ OK | ⚠️ Pagination reset on refetch |
| **Appointments Directory** | ❌ Plain text spinner | ❌ No pagination | ⚠️ Full unbounded load | ⚠️ Brief list flash | ⚠️ Blank panel if item removed |
| **Unresolved Appointments** | ❌ Plain text "Loading…" | ❌ No pagination | ⚠️ Loads ALL appointments | ⚠️ Mobile stuck on detail view | ⚠️ Blank panel if item removed |
| **Email Log** | ⚠️ animate-pulse (inconsistent) | ❌ No pagination | ⚠️ alert() on resend | ✅ OK | ❌ |
| **SMS Log** | ⚠️ Same animate-pulse | ❌ No pagination | ⚠️ Same alert() | ✅ OK | ❌ |
| **Appointment Requests** | ✅ Skeleton (good) | ❌ No pagination | ✅ OK | ⚠️ Tab switch doesn't clear selection | ⚠️ Empty flash on first load |

---

## 1. Chat Inbox

**Files:** `secretary-chat-inbox-view.tsx`

### ✅ Already Good
- `SidebarThreadSkeleton` — proper shimmer using `react-loading-skeleton`
- `isInitialLoad` flag — skeleton only on first paint, not on background refetches
- Supabase realtime channel for new messages

---

### 🐛 Bug: "Show More" Has 3 Problems

**Code (lines 963–972):**
```tsx
{hasMoreThreads && (
  <Button onClick={loadMoreThreads}>
    Show more
  </Button>
)}
```

**Problem A — Stale SSR flag:**
`hasMoreThreads` is seeded from the `initialHasMore` SSR prop. After the client refetch (`fetchThreads`) runs on mount, the server might return fewer threads (e.g., some were archived), but `hasMoreThreads` remains `true` from the old SSR value → button shows when there's nothing more to load.

**Problem B — Wrong offset in `loadMoreThreads`:**
```tsx
const loadMoreThreads = useCallback(async () => {
  const res = await getChatThreadsAction({ limit: 20, offset: threads.length }); // BUG
  // threads.length = ACTIVE + ARCHIVE combined
  // But you might be on ARCHIVE tab only — offset is miscounted
}, [threads.length]);
```
When on ARCHIVE tab, `threads.length` includes ACTIVE threads too, so the offset is too large → items get skipped.

**Problem C — Button shows even when active tab has no more:**
The Show More button renders outside the filtered list block. If ACTIVE has 3 threads and `hasMoreThreads=true` (because ARCHIVE has more), the button shows below 3 active threads — implying there are more active conversations when there aren't.

**Fix:**
- Move button inside the `filteredThreads.length > 0` block
- Add `isLoadingMore` state — disable button + show spinner while fetching
- After fetch returns 0 results → `setHasMoreThreads(false)`
- Track offset per-tab, or use the total `threads.length` only for tab-agnostic pagination

---

### 🐛 Bug: `fetchThreads` Resets Pagination — Wipes "Show More" Loaded Data

```tsx
const fetchThreads = useCallback(async () => {
  const res = await getChatThreadsAction({ limit: 20, offset: 0 }); // always back to page 1
  setThreads(res.data); // overwrites ALL threads, including extras loaded via Show More
}, []);
```

After approving/cancelling an appointment, `fetchThreads()` is called. If the user had loaded 40 threads via "Show More", they're wiped back to 20.

**Fix:** After a status action, do a targeted optimistic update on just the affected thread (update its status in local state). Only call `fetchThreads` when a true full-list refresh is needed (e.g., on mount, or on tab focus).

---

### ⚠️ Stale Data: Supabase Subscription Doesn't Watch Appointment Status

The realtime channel only listens to `appointment_messages`. If another secretary changes an appointment status (APPROVED → CANCELLED), the thread's tab categorization (ACTIVE vs ARCHIVE) and badge counts won't update.

**Fix:** Add a second subscription on the `appointments` table filtering on `status` column changes, OR poll on `visibilitychange` (window focus):
```ts
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) fetchThreads();
});
```

---

### ⚠️ `fetchingThreads` Is Tracked But Never Shown

```tsx
const [fetchingThreads, setFetchingThreads] = useState(false); // set but unused in UI
```

Background refetches (after actions) are invisible — the list silently reorders.

**Fix:** Show a subtle 2px animated top border on the sidebar when `fetchingThreads=true && !isInitialLoad`. Does not require a full skeleton, just visual feedback.

---

## 2. Appointments Directory

**Files:** `secretary-appointments-view.tsx`, `sub-components/appointments-table.tsx`, `use-secretary-appointments.ts`

---

### ❌ Loading State: Plain Text, No Skeleton

```tsx
// appointments-table.tsx line 26–30
if (props.isLoading) {
  return (
    <div className="flex-1 flex items-center justify-center text-xs text-text-muted p-4">
      Loading appointments...
    </div>
  );
}
```

Inconsistent with every other page. The skeleton used in `pending-request-list-v2.tsx` is the standard.

**Fix:** Replace with skeleton rows matching the `AppointmentRow` shape:
- Row 1: `[name placeholder ——————] [badge ——]`
- Row 2: `[service name ————————————]`
- Row 3: `[date • time ——————————] [doctor ——]`

Render 7–8 rows.

---

### ⚠️ Stale Data: Loads ALL Appointments, No Limit

```ts
// use-secretary-appointments.ts line 63
getClinicAppointmentsAction({})  // no limit, no offset, no server filters
```

All filtering — tabs (Active/History), search, doctor, date, status — is done client-side via `useMemo`. As appointment history grows, this becomes slow and memory-heavy.

**Fix (short-term):** Add `limit: 200` to the action call.
**Fix (long-term):** Move active/history filter server-side. Pass `status`, `doctorId`, `dateRange` as query params.

---

### ❌ No Pagination — All Rows in DOM

All filtered appointments render at once. 500 history rows = 500 DOM nodes.

**Fix:** Add a `visibleCount` state (default 30). Render `filteredAppointments.slice(0, visibleCount)`. Add a "Show more (N remaining)" button that increments by 30.

---

### ⚠️ Tab Badge vs Search Mismatch

Tab headers show `upcomingCount` / `historyCount` from the unfiltered `view.appointments` array. When search is active, badge says "Active (12)" but list shows 3.

**Fix (option A):** Clear search on tab change.
**Fix (option B):** When search is active, annotate: `"Active (12) · 3 shown"`.

---

## 3. Unresolved Appointments

**Files:** `secretary-past-appointment-follow-ups-view.tsx`, `use-past-appointment-follow-ups.ts`

---

### ❌ Loading State: Plain Text, No Skeleton

```tsx
// line 96
{view.isLoading ?
  <div className="p-6 text-center text-sm text-muted-foreground">Loading follow-ups…</div>
  : null}
```

**Fix:** Replace with 5 skeleton rows matching follow-up item shape: `[name] [status badge] / [service] / [date] [days waiting]`.

---

### ⚠️ Stale Data: Loads ALL Appointments Then Filters Client-Side

```ts
// use-past-appointment-follow-ups.ts line 36
getClinicAppointmentsAction({})  // loads entire appointment history

// Then filters:
const missedCheckouts = appointments.filter(a => a.date < today && a.status === 'CHECKED_IN');
const unresolvedNoShows = appointments.filter(a => a.date < today && a.status === 'NO_SHOW' && !a.noShowResolvedAt);
```

Transfers thousands of records to find a handful of follow-up items. This is the most wasteful fetch in the app.

**Fix:** Server-side filter:
```ts
getClinicAppointmentsAction({
  statuses: ['CHECKED_IN', 'NO_SHOW'],
  dateBefore: today,
})
```

---

### 🐛 Mobile Bug: Tab Change Leaves User on Detail View

`view.selectTab(...)` in the hook clears `selectedAppointmentId`, but the view's `mobileView` state remains `'detail'`. On mobile, the user sees a blank detail pane with a back arrow leading nowhere.

**Fix:** In the tab button `onClick`:
```tsx
onClick={() => {
  view.selectTab('missed-checkouts');
  setMobileView('list'); // ← add this
}}
```

---

## 4. Communication History — Email Log

**Files:** `secretary-email-log-view.tsx`, `use-secretary-email-log.ts`

---

### ⚠️ Loading State: `animate-pulse` Divs, Not `<Skeleton>` Component

```tsx
// line 184
<div className="flex items-start w-full gap-3 border-b p-4 animate-pulse">
  <div className="size-9 rounded-full bg-muted/40 shrink-0" />
  <div className="h-3.5 w-32 rounded bg-muted/40" />
  ...
</div>
```

Uses raw `animate-pulse` divs — different shimmer color, different speed, inconsistent with skeleton used in Chat Inbox and Appointment Requests.

**Fix:** Replace with `<Skeleton>` from `@/components/ui/skeleton`. Extract a shared `<SidebarLogSkeleton />` component for both Email and SMS log to reuse.

---

### 🐛 Bug: `alert()` Calls on Resend — Blocks Entire Browser Tab

```ts
// use-secretary-email-log.ts line 77–83
if (res.error) {
  alert(res.error);             // freezes everything
} else {
  alert('Email resent successfully!');
}
// Same in handleRetryAllFailed()
```

**Fix:** Add a `toast` state to the hook (same pattern as `InquiryToast`):
```ts
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
```
Replace all `alert()` calls with `setToast(...)`. Render `<InquiryToast toast={toast} />` at the bottom of the view.

---

### ❌ No Pagination — All Logs Loaded at Once

`getOutboxLogsAction()` returns every log entry. Email logs grow with every appointment notification sent (booking, reminder, reschedule, etc.).

**Fix:** Add `limit: 50, offset: 0`. Add a "Load More" button at list bottom, same pattern as Chat Inbox.

---

### ⚠️ `onlyAppointments` Filter Is Silent — No UI Toggle

```ts
const [onlyAppointments, setOnlyAppointments] = useState(true); // silently filters out OTP emails
```

Filters out `PATIENT_REGISTERED` and `PASSWORD_RESET_REQUESTED` event types with no user control. Admins can't find OTP logs.

**Fix:** Add a toggle in the sidebar header: `[ ] Appointment emails only`. State is already tracked, just expose it.

---

## 5. Communication History — SMS Log

**Files:** `secretary-sms-log-view.tsx`, `use-secretary-sms-log.ts`

> Identical structure to Email Log. All bugs above apply. Specific callouts:

- ❌ Same `animate-pulse` pattern → fix with `<Skeleton>`
- 🐛 Verify `use-secretary-sms-log.ts` for `alert()` calls → replace with toast
- ❌ No pagination → same "Load More" fix

---

## 6. Appointment Requests

**Files:** `secretary-pending-requests-view-v2.tsx`, `pending-request-list-v2.tsx`, `use-secretary-inquiries-queue.ts`

### ✅ Already Good
`pending-request-list-v2.tsx` uses `<Skeleton>` with correct shape. **Use this as the standard for all other pages.**

---

### 🐛 Bug: `isLoadingInquiries` Starts `false` — Empty State Flashes Before Skeleton

```ts
// use-secretary-inquiries-queue.ts line 23
const [isLoadingInquiries, setIsLoadingInquiries] = useState(false); // starts false!
```

On mount, `loadInquiries` is called in a `useEffect`. Before it runs, `isLoadingInquiries=false` so the "No requests found" empty state shows briefly before the skeleton.

**Fix (one line):**
```ts
const [isLoadingInquiries, setIsLoadingInquiries] = useState(true); // start true
```

---

### ⚠️ Tab Switch Does Not Clear Selection → Blank Detail Panel

Switching tabs calls `props.setActiveTab(tab.key)` but does NOT reset `selectedInquiryId`. If a NEW inquiry was selected and you switch to CONVERTED, `selectedInquiry = inquiries.find(i => i.id === selectedInquiryId)` returns `undefined` and the detail panel goes blank with no feedback.

**Fix:** In the tab click handler in `pending-request-list-v2.tsx`:
```tsx
onClick={() => {
  props.setActiveTab(tab.key);
  props.onSelectInquiry(null); // ← add this to clear selection
}}
```

---

### ⚠️ Badge Count vs Search Mismatch

Tab badges show `props.tabCounts[tab.key]` (total from server). When search is active, the visible list is smaller. Badge says "New (5)" but only 2 show.

**Fix:** When `search !== ''`, use `filteredInquiries.length` for the badge instead.

---

### ❌ No Pagination

```ts
const loadInquiries = async () => {
  const res = await getInquiriesAction(); // no limit, no offset
};
```

**Fix:** Add `limit`/`offset` params. Add "Load More" button with `isLoadingMore` state.

---

## Cross-Cutting Issues (All Pages)

### 1. "Show More" Has No Loading/Disabled State
Only Chat Inbox has Show More. It has no loading indicator. Double-clicking fires two parallel requests.
- **Fix:** Add `isLoadingMore` boolean. Disable button and show a `<Loader2 className="animate-spin" />` inside.

### 2. Selection Silently Disappears After Refetch
After `fetchData()`, if the selected item was resolved/removed from the new list, `selectedAppointment` becomes `undefined`. The detail panel goes blank with no explanation.
- **Fix:** After each refetch, check:
```ts
if (selectedId && !newList.find(i => i.id === selectedId)) {
  setSelectedId(null);
  showToast('Item resolved and removed from list.', 'info');
}
```

### 3. All Tab Badge Counts Ignore Active Search
Every page with tab badges + search shows total counts, not filtered counts. Confusing mismatch when search is active.
- **Fix:** When search is non-empty, show filtered count: `"Active (3 of 12)"`.

### 4. Three Hooks Call `getClinicAppointmentsAction({})` Unbounded
- `use-secretary-appointments.ts`
- `use-past-appointment-follow-ups.ts`
- Both load **the entire appointment history** every mount

This is the #1 scalability concern. All three need server-side filtering added.

### 5. Skeleton Row Count Should Match Intended Page Size
Pages hardcode 6–8 skeleton rows. These should eventually equal `PAGE_SIZE` so the skeleton looks natural when real data loads.

---

## Prioritized Action Plan

| # | Priority | Fix | Files to Change |
|---|---|---|---|
| 1 | 🔴 High | Replace plain-text loaders with proper skeleton rows | `appointments-table.tsx`, `secretary-past-appointment-follow-ups-view.tsx` |
| 2 | 🔴 High | Fix Show More: gate on filtered data, fix offset, add loading state | `secretary-chat-inbox-view.tsx` |
| 3 | 🔴 High | Init `isLoadingInquiries = true` (1-line fix) | `use-secretary-inquiries-queue.ts` |
| 4 | 🔴 High | Replace `alert()` with toast in email/SMS resend | `use-secretary-email-log.ts`, `use-secretary-sms-log.ts` |
| 5 | 🟡 Medium | Normalize `animate-pulse` → `<Skeleton>` component | `secretary-email-log-view.tsx`, `secretary-sms-log-view.tsx` |
| 6 | 🟡 Medium | Disable Show More button + spinner while loading | `secretary-chat-inbox-view.tsx` |
| 7 | 🟡 Medium | Clear `selectedInquiryId` on tab switch | `pending-request-list-v2.tsx` |
| 8 | 🟡 Medium | Show subtle sidebar refetch indicator (`fetchingThreads`) | `secretary-chat-inbox-view.tsx` |
| 9 | 🟡 Medium | After refetch: detect removed item → clear selection + toast | All hooks with `fetchData` |
| 10 | 🟡 Medium | Mobile tab change → reset `mobileView` to `'list'` | `secretary-past-appointment-follow-ups-view.tsx` |
| 11 | 🟢 Low | Add client-side "Show More" (pageSize 30) to all flat lists | Appointments Directory, Unresolved, Email, SMS, Requests |
| 12 | 🟢 Low | Fix `loadMoreThreads` offset (should be tab-filtered count, not total) | `secretary-chat-inbox-view.tsx` |
| 13 | 🟢 Low | Expose `onlyAppointments` toggle in Email Log header | `secretary-email-log-view.tsx` |
| 14 | 🟢 Low | Show `"X of Y"` filtered count in badges when search is active | All list components |
| 15 | 🟢 Low | Move filtering server-side — pass `statuses`, `dateBefore` to action | `use-secretary-appointments.ts`, `use-past-appointment-follow-ups.ts` |
