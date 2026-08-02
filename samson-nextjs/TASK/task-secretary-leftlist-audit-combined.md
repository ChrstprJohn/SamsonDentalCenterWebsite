# Secretary Left-Side List Audit (Combined)
> Pages: Chat Inbox · Appointments Directory · Unresolved Appointments · Communication History · Appointment Requests
> Scope: Left-side lists only — pagination, stale data, loading/skeleton states, Show More edge cases, tab/page-change behavior, fetch patterns, selection, error states.

---

## Summary Matrix

| Page | Loading State | Show More / Pagination | Stale Data | Tab-change Bugs | Error State | Selection on Refetch |
|---|---|---|---|---|---|---|
| **Chat Inbox** | ✅ Skeleton (good) | ⚠️ 3 Show More bugs | ⚠️ Status changes not realtime | ✅ OK | ❌ Silent on failure | ⚠️ Pagination wiped on refetch |
| **Appointments Directory** | ❌ Plain text only | ❌ No pagination | ⚠️ Unbounded full load | ⚠️ Brief list flash | ❌ Empty state shown on error | ⚠️ Blank panel if item removed |
| **Unresolved Appointments** | ❌ Plain text only | ❌ No pagination | ⚠️ Loads ALL appointments | ⚠️ Mobile stuck on detail | ❌ Error shown, no Retry button | ⚠️ Blank panel if item removed |
| **Communication History** | ⚠️ animate-pulse (inconsistent) | ❌ No list pagination | ⚠️ Activity capped at 2,000 silently | ✅ OK | ❌ Silent fetch failures | ⚠️ Timeline race condition |
| **Appointment Requests** | ✅ Skeleton (good) | ❌ No pagination | ✅ OK after actions | ⚠️ Tab switch doesn't clear selection | ❌ Error not rendered in UI | ⚠️ Empty flash on first load |

---

## Recommended Shared List Contract

All five lists should use the same state model and response shape.

### State enum

```ts
type ListState =
  | 'initial'       // first load — show skeleton rows
  | 'refreshing'    // re-fetch with rows already visible — show spinner, keep rows
  | 'loading-more'  // Show More in progress — keep rows, disable button, append skeleton
  | 'ready'         // rows rendered
  | 'empty'         // successful fetch returned 0 rows
  | 'error';        // fetch failed — show error + Retry
```

Rules:
- `initial`: render 5–8 skeleton rows matching the actual row layout.
- `refreshing` with existing rows: preserve rows, add a small top-progress stripe, disable refresh controls.
- `loading-more`: keep rows, disable button, show spinner or appended skeleton rows inside button.
- `empty`: render empty message **only after a successful request returned 0 rows**. Never show empty state while a request is pending.
- `error` with no rows: show error message and a `Retry` action.
- `error` with old rows: keep old rows and show a "Could not refresh" warning with `Retry`.

### Response shape

```ts
type PageResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
};
```

Use a **keyset cursor** (sort field + `id` as tie-breaker) rather than `offset` — offset pagination drifts when new rows are inserted while the user is browsing.

---

## Cross-Cutting Issues (All Pages)

### 1. All Growing Lists Are Unbounded

Three hooks call `getClinicAppointmentsAction({})` with no limit, no filter, no cursor:
- `use-secretary-appointments.ts`
- `use-past-appointment-follow-ups.ts`
- `use-appointment-email-timeline.ts` (separately fetches up to 2,000 outbox rows)

`getInquiriesAction()` in `use-secretary-inquiries-queue.ts` is also unbounded.

**Fix:** Every list endpoint must accept:
```ts
{ limit: 25, cursor, search, status, tab, sortBy, sortDirection }
```

### 2. Search and Filters Must Be Server-Side

Local filtering is acceptable only while the entire dataset is loaded. With pagination it breaks — a match on page 2 is invisible, and "No results" is misleading when matches exist but aren't loaded.

Every search/filter/tab change should:
1. Reset cursor and current rows.
2. Clear or validate selected item.
3. Fetch the first page for the new query.
4. Show skeleton (no rows yet) or a non-blocking refresh state (rows exist).

Debounce free-text input ~250–300 ms.

### 3. `Show More` Must Reflect the Exact Active Query

`hasMore` must come from the server-side result for the current search/tab/filter — not from the unfiltered dataset.

**Correct pattern:**
```tsx
{items.length > 0 && hasMore && (
  <Button disabled={isLoadingMore} onClick={loadMore}>
    {isLoadingMore ? 'Loading…' : 'Show more'}
  </Button>
)}
```

Edge cases to handle:
- 0 rows total: no button.
- 3 rows, no more: no button.
- Exactly 20 rows and no 21st: no button.
- 21 rows with page size 20: button shows, disappears after page 2.
- Filtered result is 0 while another tab has more: **no button** for this tab.
- Rapid double-click: one request only (use `isLoadingMore` guard).
- Failed next page: preserve existing rows, show `Could not load more. Retry`.
- New row arrives while browsing: no duplicate/skipped row on next page request.

### 4. Race Conditions on Overlapping Requests

Any list can receive overlapping fetches from tab changes, search changes, load-more, or selecting another item. Guard all responses with a request sequence number:

```ts
const requestId = ++latestRequestId.current;
const result = await fetchPage(query);
if (requestId !== latestRequestId.current) return;
setState(result);
```

This is **critical** for Communication History timelines — selecting A then B can display A's logs over B's.

### 5. Selection Must Be Validated After Visible Set Changes

After any tab/search/filter/refresh:
- If the selected record is no longer in the visible result set: clear it, or keep the pane open with a "This item is outside the current filter" label.
- If the record was deleted/resolved/converted: clear it and show a toast.
- Never leave a detail pane open for an item not visible in the left list.

```ts
if (selectedId && !newList.find(i => i.id === selectedId)) {
  setSelectedId(null);
  showToast('Item resolved and removed from list.', 'info');
}
```

### 6. No Realtime Refresh on Most Pages

Only Chat Inbox subscribes to realtime events, and only for `appointment_messages` — not for appointment status changes. All other pages have no subscription.

**Fix:** For each page, add either:
- A realtime subscription on the relevant table/status column, or
- A `visibilitychange` + route-entry refresh policy with a manual refresh button and stale timestamp indicator.

After any action that changes a row's status, update that row optimistically or await the refetch before clearing the action's busy state.

### 7. Tab Badge Counts Don't Reflect Active Search

All pages show total counts in tab badges. When search is active the visible list is smaller, creating a confusing mismatch ("Active (12)" but 3 show).

**Fix:** When search is non-empty, show filtered count: `"Active (3 of 12)"`.

---

## Page-by-Page Findings

---

## 1. Chat Inbox

**Files:** `secretary-chat-inbox-view.tsx`

### ✅ Already Good
- `SidebarThreadSkeleton` — proper shimmer using `react-loading-skeleton`
- `isInitialLoad` flag separates first-paint skeleton from background refetches
- Supabase realtime channel for new messages

---

### 🐛 Bug: "Show More" Has 3 Problems

**Code (lines 963–972):**
```tsx
{hasMoreThreads && (
  <Button onClick={loadMoreThreads}>Show more</Button>
)}
```

**Problem A — Stale SSR flag:**
`hasMoreThreads` is seeded from the SSR `initialHasMore` prop. After the client refetch (`fetchThreads`) runs on mount, the server might return fewer threads (e.g., some archived), but `hasMoreThreads` stays `true` from the old SSR value → button shows when there's nothing more.

**Problem B — Wrong offset:**
```tsx
const loadMoreThreads = useCallback(async () => {
  const res = await getChatThreadsAction({ limit: 20, offset: threads.length });
  // threads.length = ACTIVE + ARCHIVE combined
  // On ARCHIVE tab: offset is too large → items skipped
}, [threads.length]);
```

**Problem C — Button renders outside the tab filter block:**
If ACTIVE has 3 threads and `hasMoreThreads=true` (because ARCHIVE has more), the button shows below 3 active threads implying more active conversations exist when they don't.

**Fix:**
- Move button inside `filteredThreads.length > 0 && hasMoreThreads` condition
- Add `isLoadingMore` state — disable button + show spinner while fetching
- After fetch returns 0 results → `setHasMoreThreads(false)`
- Move Active/Archive/Unread/search filtering to the server query so `hasMore` reflects the exact filtered result

---

### 🐛 Bug: `fetchThreads` Always Resets to Page 1 — Wipes "Show More" Data

```tsx
const fetchThreads = useCallback(async () => {
  const res = await getChatThreadsAction({ limit: 20, offset: 0 }); // always page 1
  setThreads(res.data); // overwrites all threads loaded via Show More
}, []);
```

After approving/cancelling, `fetchThreads()` wipes all Show More loaded threads back to 20.

**Fix:** After a status action, do a targeted optimistic update on the affected thread only. Reserve `fetchThreads` for true full-list refresh (mount, window focus).

---

### 🐛 Bug: No `isLoadingMore` Guard — Double-Clicks Fire Duplicate Requests

There is no guard preventing duplicate load-more requests. Two clicks can use the same offset and append duplicate rows.

**Fix:** `if (isLoadingMore) return;` at the top of `loadMoreThreads`. Disable the button while `isLoadingMore=true`.

---

### ⚠️ Load-More Failures Are Silent

A failed `loadMoreThreads` request has no error state or retry action. The button remains visible with no explanation.

**Fix:** Add a `loadMoreError` state. Show `"Could not load more conversations. Retry"` below the list on failure.

---

### ⚠️ Stale Data: Realtime Only Covers Messages, Not Appointment Status

The Supabase channel listens on `appointment_messages` only. If another secretary changes an appointment status, the thread's tab categorization (ACTIVE vs ARCHIVE) and badge counts don't update.

**Fix:** Add a second subscription on the `appointments` table for status changes, or poll on `visibilitychange`:
```ts
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) fetchThreads();
});
```

---

### ⚠️ `fetchingThreads` Is Tracked But Never Shown in UI

```tsx
const [fetchingThreads, setFetchingThreads] = useState(false); // unused in UI
```

Background refetches are invisible — list silently reorders after actions.

**Fix:** Show a 2px animated top border stripe on the sidebar when `fetchingThreads=true && !isInitialLoad`.

---

### ⚠️ Tab Counts Are Only Counts of Loaded Rows

With more than 20 threads, the Active and Archive tab counts show only how many were fetched, not the real totals.

**Fix:** Server should return total counts separately from the page items. Display these as the badge numbers.

---

## 2. Appointments Directory

**Files:** `secretary-appointments-view.tsx`, `sub-components/appointments-table.tsx`, `use-secretary-appointments.ts`

---

### ❌ Loading State: Plain Text, No Skeleton

```tsx
// appointments-table.tsx line 26–30
if (props.isLoading) {
  return (
    <div className="...">Loading appointments...</div>
  );
}
```

**Fix:** Replace with skeleton rows matching `AppointmentRow` shape (7–8 rows):
- Row 1: `[name ——————————] [badge ——]`
- Row 2: `[service name ————————]`
- Row 3: `[date • time ———————] [doctor —]`

---

### ❌ No Error State — Failed Fetch Shows Empty State

The hook logs errors and ends loading. The UI then shows "No appointments found" after a network failure — identical to a successful empty result. The user cannot distinguish the two.

**Fix:** Expose an `error` state. Show `"Could not load appointments. Retry"` instead of the empty state on failure.

---

### ⚠️ Unbounded Fetch — All Appointments, No Server Filters

```ts
getClinicAppointmentsAction({})  // no limit, no filter, loads entire history
```

All Active/History tab filtering, search, doctor, date, and status filters are `useMemo` client-side. Nested `patient`, `doctor`, `service`, `guest contact`, and `status_history` data is fetched for every appointment even though the left list row only needs a summary.

**Fix (short-term):** Add `limit: 200`.
**Fix (long-term):** Create a lightweight directory summary endpoint. Fetch full detail only after row selection.

---

### ❌ No Pagination — All Rows Render in DOM

500 history rows = 500 DOM nodes simultaneously.

**Fix:** Add `visibleCount` state (default 30), render `filteredAppointments.slice(0, visibleCount)`, add `"Show more (N remaining)"` button.

---

### ⚠️ Refetch Not Awaited After Actions

`fetchData()` is called without `await` in reschedule and cancel flows. The action busy state can clear before the list is refreshed, leaving a stale appointment visible.

**Fix:** `await fetchData()` in action callbacks, or update the row optimistically from the mutation response.

---

### ⚠️ Selected Detail Can Show an Item Hidden by Search

`selectedAppointmentId` is not cleared when search changes `filteredAppointments`. The detail pane can show an appointment invisible in the left list.

**Fix:** Validate selection when the filtered set changes (see Cross-Cutting Issue #5).

---

### ⚠️ Tab Badge vs Search Mismatch

`upcomingCount` / `historyCount` are from the unfiltered array. When search is active, badge says "Active (12)" but list shows 3.

**Fix (A):** Clear search on tab change.
**Fix (B):** Annotate badge: `"Active (12) · 3 shown"`.

---

## 3. Unresolved Appointments

**Files:** `secretary-past-appointment-follow-ups-view.tsx`, `use-past-appointment-follow-ups.ts`

---

### ❌ Loading State: Plain Text, No Skeleton

```tsx
{view.isLoading ?
  <div className="p-6 text-center text-sm text-muted-foreground">Loading follow-ups…</div>
  : null}
```

**Fix:** Replace with 5 skeleton rows matching the follow-up row shape: `[name] [badge] / [service] / [date] [days waiting]`.

---

### ⚠️ Unbounded Fetch — Most Wasteful in the App

```ts
getClinicAppointmentsAction({})  // loads ENTIRE appointment history

// Then filters:
const missedCheckouts = appointments.filter(a => a.date < today && a.status === 'CHECKED_IN');
const unresolvedNoShows = appointments.filter(a => a.date < today && a.status === 'NO_SHOW' && !a.noShowResolvedAt);
```

Transfers thousands of records to find a handful of follow-up items.

**Fix:** Server-side filter:
```ts
getClinicAppointmentsAction({
  statuses: ['CHECKED_IN', 'NO_SHOW'],
  dateBefore: today,
})
```

---

### ❌ Error Shown But No Retry Action

The hook exposes an error string and it is rendered, but there is no `Retry` button. The user must navigate away or reload the page to recover.

**Fix:** Add a `Retry` button that calls `view.fetchData()`.

---

### ❌ No Refresh Control or Realtime Update

A checkout or no-show resolution from another screen/device leaves the row visible until a local action triggers `fetchData()` or the page remounts.

**Fix:** Add a manual refresh button with stale timestamp indicator, or a realtime subscription on appointment status changes.

---

### 🐛 Mobile Bug: Tab Change Leaves User on Blank Detail View

`view.selectTab(...)` clears `selectedAppointmentId` but the view's `mobileView` state stays `'detail'`. On mobile: blank pane, back arrow leads nowhere.

**Fix:**
```tsx
onClick={() => {
  view.selectTab('missed-checkouts');
  setMobileView('list'); // add this
}}
```

---

### ⚠️ Search Can Hide Selected Item Without Clearing Selection

Same as Appointments Directory: `selectedAppointmentId` is not validated when search changes the visible list.

---

## 4. Communication History

**Files:** `secretary-email-log-view.tsx`, `secretary-sms-log-view.tsx`, `use-secretary-email-log.ts`, `use-secretary-sms-log.ts`, `use-appointment-email-timeline.ts`, `appointment-email-timeline-view.tsx`

---

### ⚠️ Loading State: `animate-pulse` Divs, Not `<Skeleton>` Component

Email and SMS log use raw `animate-pulse` divs — different shimmer color, different speed, inconsistent with `<Skeleton>` used in Chat Inbox and Appointment Requests.

**Fix:** Replace with `<Skeleton>` from `@/components/ui/skeleton`. Extract a shared `<SidebarLogSkeleton />` component for both Email and SMS.

---

### 🐛 Bug: `alert()` Calls on Resend — Blocks Entire Browser Tab

```ts
// use-secretary-email-log.ts line 77–83
if (res.error) {
  alert(res.error);              // freezes everything
} else {
  alert('Email resent successfully!');
}
// Same in handleRetryAllFailed()
```

**Fix:** Add a `toast` state to both hooks (same pattern as `InquiryToast`). Replace all `alert()` calls with `setToast(...)`. Render `<InquiryToast toast={toast} />` in the view.

---

### ❌ No Pagination — Unbounded Loads

- Left list: loads all appointments even though only those with activity are displayed.
- Activity map: fetches up to **2,000 outbox rows** with a silent cap — older activity can disappear from the list without explanation.
- Selected timeline: returns an unbounded number of logs per appointment.

**Fix:** Build a server-side communication summary query that groups by appointment and returns one page of activity cards. Paginate timelines independently. Remove the silent 2,000-row cap or expose it to the user.

---

### 🐛 Bug: Timeline Fetch Race — Selecting A Then B Can Display A's Logs

```ts
// No request-id or selected-id check before setEmailLogs
const result = await getLogs(selectedId);
setEmailLogs(result.data); // can overwrite B's logs with A's late response
```

**Fix:**
```ts
const requestId = ++timelineRequestId.current;
const result = await getLogs(selectedId);
if (requestId !== timelineRequestId.current) return;
setEmailLogs(result.data);
```

---

### ❌ List and Timeline Fetch Failures Are Silent

`fetchAppointments` has no `try/catch/finally`. A rejected request can leave the list stuck in loading or fail silently. `fetchEmailLogs` has no `try/finally` — a rejection can leave `isLoadingLogs: true` forever.

**Fix:** Wrap both in `try/catch/finally`. Set explicit `error` state. Show inline `Retry` for both the left list and the timeline panel.

---

### ⚠️ `onlyAppointments` Filter Is Silent — No UI Toggle (Email Log)

```ts
const [onlyAppointments, setOnlyAppointments] = useState(true); // silently hides OTP emails
```

Filters out `PATIENT_REGISTERED` and `PASSWORD_RESET_REQUESTED` with no user control. Admins cannot find OTP/auth logs.

**Fix:** Add a toggle in the sidebar header: `[ ] Appointment emails only`.

---

### ⚠️ Search Only Searches Patient Names

In Communication History, search filters only on patient name. Fields like recipient email/phone, event type, or latest activity preview are not searchable, even though they appear on the card.

**Fix:** Extend search to cover recipient, event type, and activity preview — or pass the search to the server query.

---

## 5. Appointment Requests

**Files:** `secretary-pending-requests-view-v2.tsx`, `pending-request-list-v2.tsx`, `use-secretary-inquiries-queue.ts`

### ✅ Already Good
`pending-request-list-v2.tsx` uses `<Skeleton>` with correct row shape. **This is the template all other pages should follow.**

---

### 🐛 Bug: `isLoadingInquiries` Starts `false` — Empty State Flashes Before Skeleton

```ts
const [isLoadingInquiries, setIsLoadingInquiries] = useState(false); // starts false!
```

On mount, `loadInquiries` runs in a `useEffect`. Before it fires, `isLoadingInquiries=false` → "No requests found" empty state flashes before the skeleton appears.

**Fix (one line):**
```ts
const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);
```

---

### ❌ Error State Not Rendered in UI

`inquiriesError` is returned from the hook but is not consumed by `SecretaryPendingRequestsViewV2` or `PendingRequestListV2`. A failed load looks identical to an empty queue.

**Fix:** Render `inquiriesError` in `PendingRequestListV2`. Add a `Retry` button that calls `props.loadInquiries()`.

---

### ⚠️ Tab Switch Does Not Clear Selection → Blank Detail Panel

`props.setActiveTab(tab.key)` does not reset `selectedInquiryId`. If a NEW inquiry was selected and you switch to CONVERTED, `selectedInquiry` returns `undefined`. Detail panel goes blank with no feedback.

**Fix:**
```tsx
onClick={() => {
  props.setActiveTab(tab.key);
  props.onSelectInquiry(null); // clear selection
}}
```

---

### ⚠️ Overlapping Reloads Can Commit Out of Order

`loadInquiries` is called by editing, reviewing, and converting inquiries, with no request-sequence guard. An older response can replace newer data.

**Fix:** Apply request-id guard (same pattern as Cross-Cutting Issue #4).

---

### ❌ No Realtime / New-Request Refresh

A new inquiry submitted by a patient, or an inquiry changed by another staff member, won't appear until a local action or page remount.

**Fix:** Subscribe to `appointment_inquiries` inserts/updates, or refresh on focus/route entry.

---

### ❌ No Pagination — All Inquiries Loaded at Once

```ts
const res = await getInquiriesAction(); // no limit, no offset
```

**Fix:** Add `limit`/`offset`/cursor. Add a "Show More" button with `isLoadingMore` guard.

---

### ⚠️ Search Can Hide Selected Request Without Clearing Selection

The detail pane is driven by the active-tab collection, not the locally searched list. After a search, the left list can show zero rows while the detail pane still shows the previously selected item.

---

## Prioritized Action Plan

### P0 — Correctness (fix immediately)

| # | Fix | Files |
|---|---|---|
| 1 | Replace plain-text loading with skeleton rows | `appointments-table.tsx`, `secretary-past-appointment-follow-ups-view.tsx` |
| 2 | Fix Show More: gate on filtered query result, add `isLoadingMore`, disable duplicate clicks, add retry/error state | `secretary-chat-inbox-view.tsx` |
| 3 | Init `isLoadingInquiries = true` (1-line fix) | `use-secretary-inquiries-queue.ts` |
| 4 | Render `inquiriesError` with Retry button in Appointment Requests | `pending-request-list-v2.tsx`, `secretary-pending-requests-view-v2.tsx` |
| 5 | Replace `alert()` with toast in email/SMS resend hooks | `use-secretary-email-log.ts`, `use-secretary-sms-log.ts` |
| 6 | Add request-id guard to Communication History timeline fetch | `use-appointment-email-timeline.ts` |
| 7 | Add request-id guard to inquiry reloads and Chat Inbox load-more | `use-secretary-inquiries-queue.ts`, `secretary-chat-inbox-view.tsx` |
| 8 | Add explicit error states to Appointments Directory and Communication History | `appointments-table.tsx`, `secretary-email-log-view.tsx` |
| 9 | Add Retry action to Unresolved Appointments error display | `secretary-past-appointment-follow-ups-view.tsx` |
| 10 | Validate and clear selection on tab/search/filter/refresh changes | All pages |

### P1 — State normalization (medium priority)

| # | Fix | Files |
|---|---|---|
| 11 | Normalize `animate-pulse` → `<Skeleton>` component | `secretary-email-log-view.tsx`, `secretary-sms-log-view.tsx` |
| 12 | Disable Show More button + spinner while loading | `secretary-chat-inbox-view.tsx` |
| 13 | Clear `selectedInquiryId` on tab switch | `pending-request-list-v2.tsx` |
| 14 | Show subtle sidebar refetch indicator (`fetchingThreads`) | `secretary-chat-inbox-view.tsx` |
| 15 | Mobile tab change → reset `mobileView` to `'list'` | `secretary-past-appointment-follow-ups-view.tsx` |
| 16 | Add `try/catch/finally` to Communication History list and timeline fetches | `use-appointment-email-timeline.ts` |
| 17 | `await fetchData()` after cancel/reschedule in Appointments Directory | `use-secretary-appointments.ts` |
| 18 | Expose `onlyAppointments` toggle in Email Log sidebar header | `secretary-email-log-view.tsx` |
| 19 | Add manual refresh button + stale indicator to Unresolved Appointments | `secretary-past-appointment-follow-ups-view.tsx` |
| 20 | Show `"X of Y"` filtered count in tab badges when search is active | All list components |

### P2 — Pagination and server-side queries (long-term)

| # | Fix | Files |
|---|---|---|
| 21 | Add cursor-based endpoints for all lists | `clinic-appointments.queries.ts`, `appointment-inquiries.queries.ts`, etc. |
| 22 | Move search, tab, status, sort filters to the server query | All action files |
| 23 | Return exact `hasMore` and tab totals for the active query | All action files |
| 24 | Fetch list-summary DTOs; full detail only after selection | `use-secretary-appointments.ts`, timeline hooks |
| 25 | Paginate Communication History timelines independently | `use-appointment-email-timeline.ts` |
| 26 | Add realtime subscriptions or refresh-on-focus for all pages | All hooks |
| 27 | Add client-side "Show More" (pageSize 30) to flat lists as interim fix | Appointments Directory, Unresolved, Email, SMS, Requests |
| 28 | Add database indexes for sort/filter columns used by each endpoint | DB migrations |

---

## Verification Checklist

Before considering list work complete, test each page with:

- [ ] 0, 1, 3, 20, 21, and 40+ records
- [ ] An exact full page where no next page exists
- [ ] A filter/search with 0 results while unfiltered dataset has more
- [ ] A match that exists only on a later page
- [ ] Rapid double-clicks on Show More or Refresh
- [ ] Refresh while a detail item is selected
- [ ] Switching tabs while a request is in flight
- [ ] A row changing status in another browser/session
- [ ] Network failure on initial load, refresh, and load-more
- [ ] A selected item being resolved, converted, cancelled, or deleted during browsing
- [ ] Communication History only: select A, immediately select B — verify B's timeline is not overwritten by A's late response
