# Appointment Left-Side List Audit

## Scope

This audit covers the left-side appointment or appointment-related lists in the Secretary V2 pages:

- Chat Inbox: `/secretary-v2/chat`
- Appointments Directory: `/secretary-v2/appointments`
- Unresolved Appointments: `/secretary-v2/past-follow-ups`
- Communication History: `/secretary-v2/communication-logs`
- Appointment Requests: `/secretary-v2/pending`

The focus is deliberately limited to list behavior: pagination, stale data, search/filter behavior, page changes, loading and skeleton states, empty states, errors, and the `Show more` edge cases.

This is a source-code audit. It identifies behavior visible from the current implementation; it does not claim that a particular network failure or database size was reproduced in a live browser session.

## Executive summary

The five lists currently use two different data strategies:

| Page | Current list strategy | Main concern |
|---|---|---|
| Chat Inbox | Server-side offset pagination, then local tab/search filtering | `Show more` is based on unfiltered data, so it can appear with no matching visible rows; no load-more lock, error state, or visible load-more state |
| Appointments Directory | Fetches every clinic appointment, then local filtering | No pagination, no skeleton, no list error state, and counts are only counts of the fetched in-memory data |
| Unresolved Appointments | Fetches every clinic appointment, then local status filtering/search | No pagination, text-only loading, no retry action, and no realtime refresh |
| Communication History | Fetches every appointment plus up to 2,000 outbox activity records | No list/timeline pagination, silent fetch failures, and selected timeline requests can race and display the wrong appointment’s logs |
| Appointment Requests | Fetches every inquiry, then local tab/search/sort filtering | Initial empty-state flash, error returned by the hook but not rendered, no pagination, no refresh, and no realtime refresh |

The recommended normalization is to make all five lists use the same list contract and the same state model:

```ts
type ListState =
  | 'initial'
  | 'refreshing'
  | 'loading-more'
  | 'ready'
  | 'empty'
  | 'error';

type PageResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
};
```

Use server-side filtering and sorting with a stable cursor, preserve existing rows during refresh, show skeleton rows only for the initial load, show an inline spinner or appended skeleton rows while loading more, and show a retry action when a request fails.

## Cross-page recommendations

### 1. Use cursor pagination for all growing lists

The Directory, Unresolved Appointments, Requests, and Communication History lists currently fetch unbounded datasets:

- `getAppointmentsByClinicQuery` has no limit or range.
- `getInquiriesQuery` has no limit or range.
- Communication History fetches all appointments and separately limits activity to 2,000 outbox rows.

Change each list endpoint to accept the complete list query:

```ts
{
  limit: 25,
  cursor,
  search,
  status,
  tab,
  sortBy,
  sortDirection,
}
```

Return `items`, `nextCursor`, and `hasMore`. Prefer a keyset cursor over `offset`, using the visible sort field plus a unique tie-breaker such as `id`. Offset pages can shift when a new appointment, inquiry, message, or log is inserted while the user is browsing.

Use a deterministic order, for example:

- Chat: `latest_message_created_at DESC, appointment_id DESC`
- Requests: `created_at DESC, id DESC`
- Appointments: `start_time ASC, id ASC` or an explicitly chosen directory order
- Communication History: `last_activity DESC, appointment_id DESC`
- Unresolved: appointment date/time plus `id`

### 2. Make search and filters part of the server query

Local filtering is acceptable for a small static dataset, but it breaks once pagination is introduced. A visible page can show “no results” even though a matching record is on a later server page.

The server should apply the active search, tab, status, unread, and date/doctor filters before calculating `hasMore`. The returned `hasMore` must describe the exact query currently shown, not the unfiltered dataset.

Debounce free-text search by about 250–300 ms. Every search/filter change should:

1. Reset the cursor and current rows.
2. Clear or validate the selected item.
3. Fetch the first page for the new query.
4. Show the initial-list skeleton or a non-blocking refresh state according to whether there are already rows on screen.

### 3. Normalize the visible loading states

Use these rules on every left list:

- `initial`: render 5–8 skeleton rows matching the actual row layout.
- `refreshing` with existing rows: keep rows visible, add a small spinner/top progress indicator, and disable refresh/retry controls.
- `loading-more`: keep existing rows visible, disable the load-more button, and append 2–3 skeleton rows or show a spinner inside the button.
- `ready`: render rows.
- `empty`: render the empty message only after a successful request has returned zero rows.
- `error` with no rows: render an error message and `Retry`.
- error with old rows: keep the old rows and show a stale-data warning with `Retry`.

Do not render “No results” while the first request is still pending. Do not replace a populated list with a full-page loading message for a refresh unless that is an intentional product decision.

### 4. Protect against stale responses

Every list can receive overlapping requests from refresh, tab changes, search changes, load-more clicks, or selecting another item. Use either an `AbortController` or a request sequence number:

```ts
const requestId = ++latestRequestId.current;
const result = await fetchPage(query);
if (requestId !== latestRequestId.current) return;
setState(result);
```

For detail/timeline data, compare the response’s item id with the current selected id before committing it. This is especially important for Communication History.

### 5. Handle selection when the visible query changes

After a tab/search/filter change or refresh:

- If the selected record is no longer in the active result set, clear the selection or keep the detail pane open with an explicit “This item is outside the current filter” state.
- If the record was deleted, resolved, converted, or moved to another status, clear it and show a short toast.
- Do not leave a detail pane open for an item that has disappeared while the left list looks unselected.

### 6. Revalidate list data after external changes

The Chat Inbox subscribes to `appointment_messages`, but the other lists do not have a list-level realtime subscription. Even Chat Inbox does not receive appointment-status changes through the same subscription. Add either:

- realtime subscriptions for the relevant table/status changes, or
- a consistent refresh-on-focus / refresh-on-route-entry policy, with a stale timestamp and manual refresh button.

After any action that changes a row’s status, update that row optimistically or refetch the exact active query and await the refetch before clearing the action’s busy state.

## Page-by-page findings

## 1. Chat Inbox

Relevant code: `src/modules/staff/views/secretary/secretary-chat-inbox-view.tsx`, `src/modules/appointments/repositories/chat/chat.queries.ts`.

### Current behavior

- The page receives an initial server-rendered page, then refetches `limit: 20, offset: 0` on mount.
- `Show more` requests the next page using `offset: threads.length`.
- Search, Active/Archive, and Unreads are applied only to the rows already in memory.
- The server reports `hasMore` for the complete chat-thread query, before the client-side filters are applied.
- Realtime messages update a loaded thread; a message for an unloaded thread triggers a fresh first-page fetch.

### Confirmed issues

1. **`Show more` can appear when the current visible list has no matching data.** `hasMoreThreads` describes the unfiltered thread collection, while `filteredThreads` describes the current tab/search/unread view. For example, the Active tab can be empty while more Archive rows exist, yet `Show more` is still rendered. A search can also show zero matches while `hasMoreThreads` remains true.

2. **Search only searches loaded pages.** A matching conversation on page 2 or later is invisible until the user manually loads more. This makes “No conversations found” misleading.

3. **Repeated `Show more` clicks can send duplicate requests.** There is no `isLoadingMore` guard and `fetchingThreads` is not used to disable or label the list action. Two clicks can use the same offset and append duplicate rows.

4. **Load-more failures are silent.** A failed request does not show an error or retry action. The button can remain visible with no explanation.

5. **Refresh can discard already loaded pages.** `fetchThreads()` replaces the entire array with the first 20 rows. This is triggered by actions and by a realtime message for a thread outside the loaded list. The user can lose their current loaded pages without an explicit indication.

6. **Realtime ordering can make offset pagination drift.** A new message moves a thread to the top. If the user then loads another offset page, records may be skipped or duplicated because the boundary moved.

7. **The tab counts are counts of loaded rows, not total counts.** Once there are more than 20 threads, Active and Archive counts are incomplete.

8. **Refresh errors leave stale data without a warning.** `fetchThreads` does not expose an error state. An error can leave the old list on screen while the user has no way to know it is stale.

### Recommended fix

Move Active/Archive/Unread/search filtering into the chat-thread query and return a cursor for the exact filter. Render `Show more` only when that exact response has `hasMore: true`.

Minimum UI behavior:

- `isInitialLoading`: list skeleton.
- `isRefreshing`: preserve rows and show a small spinner in the header.
- `isLoadingMore`: disable the button and show `Loading more…` or appended skeleton rows.
- `loadMoreError`: show `Could not load more conversations. Retry` below the list.
- Empty message should distinguish `No conversations`, `No unread conversations`, and `No matches for this search`.

Deduplicate by `appointmentId` when merging pages. Prefer a cursor over `offset`, and update the current thread in place when a realtime message arrives instead of replacing the entire page set unless a refresh is explicitly requested.

## 2. Appointments Directory

Relevant code: `src/modules/staff/hooks/secretary/use-secretary-appointments.ts`, `src/modules/staff/views/secretary/sub-components/appointments-table.tsx`, `src/modules/appointments/repositories/clinic/clinic-appointments.queries.ts`.

### Current behavior

- `getClinicAppointmentsAction({})` fetches all clinic appointments, including nested patient, doctor, service, guest contact, and status-history data.
- Active/History tabs and search are applied in the browser.
- The left list renders `Loading appointments…` instead of skeleton rows.
- Counts are calculated from the in-memory `appointments` array.

### Confirmed issues

1. **No pagination or payload boundary.** This list will grow indefinitely and currently loads status history for every appointment even though the left row only needs a small summary.

2. **The list has no error state.** The hook logs fetch errors and then ends loading. The UI can present “No appointments found” after a failed request, which is different from a successful empty result.

3. **Loading is not normalized.** A full text message causes layout shift and provides no row shape preview. Refreshing after a cancel/reschedule hides the rows instead of preserving them while the refresh is in flight.

4. **Search is limited to the fetched dataset.** This is currently equivalent to all records, but it will become incorrect once pagination is added unless the query is moved server-side.

5. **Active/History counts are not durable totals.** They are based on the currently loaded array. After server pagination, these counts must come from server totals or be labeled as loaded counts.

6. **The selected detail can remain open while its row is hidden by search.** Search changes `filteredAppointments`, but it does not clear or validate `selectedAppointmentId`. The detail pane can therefore show an appointment that is not represented in the visible left list.

7. **After a successful action, the refetch is not awaited.** `fetchData()` is called without `await` in the reschedule and cancel flows. The action busy state can finish before the list/detail data has been refreshed, leaving a stale appointment visible briefly or longer if the refresh fails.

### Recommended fix

Create a lightweight directory endpoint that returns only row fields and supports `tab`, search, doctor/date/status filters, cursor, and counts. Fetch the full appointment detail only after selecting a row. Use a stable summary DTO instead of returning `status_history` for every row.

Add a reusable appointment-row skeleton and separate `error` from `empty`. After cancel/reschedule, await a refetch or update the selected row from the mutation response, then revalidate the active query and selection.

## 3. Unresolved Appointments

Relevant code: `src/modules/staff/hooks/secretary/use-past-appointment-follow-ups.ts`, `src/modules/staff/views/secretary/secretary-past-appointment-follow-ups-view.tsx`.

### Current behavior

- The hook fetches every clinic appointment and derives Missed Checkouts and No-shows locally.
- Search is local to the already fetched list.
- The list uses a text-only `Loading follow-ups…` state.
- An error string exists and is rendered, but there is no retry button.

### Confirmed issues

1. **No pagination and no server-side unresolved filter.** The page downloads all appointments just to retain two subsets: past `CHECKED_IN` appointments and unresolved past `NO_SHOW` appointments.

2. **No refresh control or realtime update.** A checkout or no-show resolution from another screen/device can leave a row visible until the page is remounted or an action on this page triggers `fetchData()`.

3. **No retry action.** The error is displayed, but the user cannot recover without navigating away or reloading the page.

4. **Loading is text-only.** The row layout is known, so skeleton rows should be used and should not be replaced by an empty state while the request is pending.

5. **Search can hide the selected row without clearing the detail selection.** As with the Directory, the selected appointment is derived from the unsearched tab list while the left list is derived from `visibleAppointments`.

6. **Resolution refetch does not preserve a list-level refresh state.** The selected item is cleared before the refetch finishes, but the list has no explicit indication that it is being revalidated.

### Recommended fix

Query only unresolved records on the server with the active tab and search/filter. Return a cursor and exact `hasMore`. Add skeleton rows, a `Retry` action, a refresh button, and a small “updated just now”/stale indicator. When a resolution succeeds, remove the row immediately from the visible list and then revalidate in the background.

## 4. Communication History

Route: `/secretary-v2/communication-logs`.

Relevant code: `src/modules/staff/hooks/secretary/use-appointment-email-timeline.ts`, `src/modules/staff/views/secretary/appointment-email-timeline-view.tsx`, `src/modules/emails/actions/logs/get-communication-activity.action.ts`, `src/modules/emails/actions/logs/get-email-logs-by-appointment.action.ts`.

### Current behavior

- The left list fetches all appointments and separately fetches up to 2,000 outbox rows to build an activity map.
- Only appointments with activity are shown in the default left list.
- Search filters only patient name locally.
- Selecting an appointment fetches all communication logs for that appointment.
- Initial list and selected-timeline skeletons already exist.

### Confirmed issues

1. **The left list is not paginated.** It loads all appointments even though only appointments with activity are displayed.

2. **Activity is capped at 2,000 records without telling the user.** Older communication activity can be absent from the activity map, causing valid appointments to disappear from the left list or show incomplete failure counts.

3. **The selected timeline is not paginated.** An appointment with a long communication history can return an unbounded number of logs.

4. **List fetch failures are not exposed.** `fetchAppointments` has no `try/catch/finally` around the two requests. If either request rejects, the list can remain in a loading state or fail without a retryable error UI.

5. **Timeline fetch failures can remain stuck in loading.** `fetchEmailLogs` does not use `try/finally`. A rejected request can leave `isLoadingLogs` true.

6. **Selecting appointments quickly can display the wrong timeline.** Selecting A and then B starts two requests. If A resolves after B, its logs can overwrite the logs for the currently selected B because there is no request-id or selected-id check before `setEmailLogs`.

7. **Search only searches patient names.** It does not search recipient, event type, or latest activity preview, even though those fields are present in the cards.

8. **There is no realtime activity update.** The user must manually refresh to see newly created outbox records or changed delivery status.

### Recommended fix

Build a server-side communication summary query that groups by appointment and returns one page of activity cards, with `hasFailed`, failure count, latest activity, and channels. Make the activity query’s date/order boundary deterministic and remove the hidden 2,000-row cap from the user-facing result.

Paginate the selected appointment’s timeline separately. Add an inline `Retry` state for both the left list and timeline. Guard the timeline response:

```ts
const requestId = ++timelineRequestId.current;
const result = await getLogs(selectedId);
if (requestId !== timelineRequestId.current) return;
setEmailLogs(result.data);
```

When refreshing the left list, preserve the currently displayed cards if possible and show a refresh indicator rather than unnecessarily blanking the list. If the selected appointment no longer has activity, clear selection with a clear empty/detail message.

## 5. Appointment Requests

Current V2 route: `/secretary-v2/pending`.

Important naming note: the current V2 left list is an `appointment_inquiries` list, not a list of rows from the `appointments` table. It displays New, Converted, and Dropped inquiries, then converts or drops them from the detail pane.

Relevant code: `src/modules/staff/hooks/secretary/use-secretary-inquiries-queue.ts`, `src/modules/staff/views/secretary/sub-components/pending-request-list-v2.tsx`, `src/modules/appointments/repositories/booking/appointment-inquiries.queries.ts`.

### Current behavior

- `getInquiriesAction()` fetches all inquiry rows.
- The hook filters by active tab.
- The list component filters by patient/service search and sorts newest/oldest locally.
- Skeleton rows exist, but the hook initializes `isLoadingInquiries` to `false`.
- The hook exposes `inquiriesError`, but the V2 view does not pass it to the list or render it.

### Confirmed issues

1. **The initial loading flag is wrong.** Because `isLoadingInquiries` starts as `false`, the first render can show “No requests found” before the effect starts loading. This produces an empty-state flash before the skeleton appears.

2. **The list has no pagination.** `getInquiriesQuery` has no limit/range and returns every inquiry across all three statuses.

3. **The error state is not visible.** `inquiriesError` is returned from the hook but is not consumed by `SecretaryPendingRequestsViewV2` or `PendingRequestListV2`. A failed load can look like an empty queue.

4. **No retry or refresh control exists.** The user cannot retry a failed inquiry fetch from the list.

5. **Search and sort are local.** This is fine only while the entire dataset is loaded. With pagination, a matching request may be outside the loaded page and the local sort will not represent the full result set.

6. **No realtime/new-request refresh exists.** A new inquiry submitted by a patient or an inquiry changed by another staff member will not appear until a local action calls `loadInquiries` or the page is remounted.

7. **Overlapping reloads can commit out of order.** Editing an inquiry or reviewing one calls `loadInquiries`, while another load may already be in progress. There is no request sequence check to prevent an older response from replacing newer data.

8. **Changing search can hide the selected request without clearing selection.** The detail pane is based on the active-tab collection, not the locally searched list. The left list can therefore show no selected row while the detail pane still shows the hidden request.

### Recommended fix

Initialize `isLoadingInquiries` to `true`, add a visible error/retry state, and provide a refresh button. Add server-side status/search/sort/cursor parameters. Return exact tab totals separately from the page items so the New/Converted/Dropped counts remain correct after pagination.

After a conversion or drop, remove the item optimistically from the active tab, clear selection, then revalidate the active query. Subscribe to new/updated `appointment_inquiries` records or refresh on focus/route entry.

## Exact `Show more` behavior to implement

For any list using a load-more pattern:

```tsx
{items.length > 0 && hasMore && (
  <Button
    disabled={isLoadingMore}
    onClick={loadMore}
  >
    {isLoadingMore ? 'Loading…' : 'Show more'}
  </Button>
)}
```

The important rule is that `hasMore` must be calculated after applying the current server-side query. Do not hide the button merely because the current page has three rows; three rows can be the last page or a partial page with more rows available. Do not show it merely because some other tab or search scope has more rows.

For an empty filtered result:

- If the server says there are no matching rows: show the empty state and no `Show more` button.
- If the client is still using an unfiltered local cache and more raw pages may contain matches: show `Load more results` as an explicit recovery action, not as a normal pagination control. The preferred fix is server-side filtering so this ambiguity disappears.

Also handle these cases:

- 0 rows total: no button.
- 3 rows total: no button.
- exactly 20 rows with no 21st row: no button.
- 21 rows with a 20-row page size: button is visible, then disappears after page 2.
- filtered result has 0 rows while another unfiltered tab has more: no button.
- rapid double click: one request only.
- failed next page: preserve existing rows and show retry.
- new row arrives while browsing: no duplicate or skipped row after the next page request.

## Suggested implementation order

### P0 — Correctness and state normalization

1. Fix Chat Inbox `Show more` visibility, add `isLoadingMore`, disable duplicate clicks, and add a retry/error state.
2. Add request-id guards to Chat Inbox refresh/load-more, Communication History timeline fetches, and inquiry reloads.
3. Fix the Requests initial loading flash and render `inquiriesError` with `Retry`.
4. Add explicit error states to Appointments Directory and Communication History.
5. Clear or validate selection whenever search/tab/filter/refresh changes the visible result set.

### P1 — Pagination and query correctness

1. Add cursor-based endpoints for each list.
2. Move search, tabs, statuses, unread, and sorting to the server query.
3. Return exact `hasMore` and totals for the active query.
4. Fetch list-summary DTOs and fetch full detail only after selection.
5. Paginate Communication History timelines independently from the left list.

### P2 — Freshness and performance

1. Add realtime or refresh-on-focus behavior for appointments, inquiries, unresolved statuses, and outbox activity.
2. Preserve old rows during refresh and show a stale/updated indicator.
3. Add indexes for the final sort/filter columns used by each endpoint.
4. Add a server-side count strategy that does not require loading all rows into the browser.

## Verification checklist

Before considering the list work complete, test each page with:

- 0, 1, 3, 20, 21, and 40+ records.
- An exact full page where no next page exists.
- A filter/search with no results while the unfiltered dataset has more records.
- A match that exists only on a later page.
- Rapid double-clicks on `Show more` or refresh.
- Refresh while a detail item is selected.
- Switching tabs while a request is in flight.
- A row changing status in another browser/session.
- Network failure on initial load, refresh, and load more.
- A selected item being resolved, converted, cancelled, or deleted during browsing.
- Communication History: select A, immediately select B, and verify B’s timeline cannot be overwritten by A’s late response.

