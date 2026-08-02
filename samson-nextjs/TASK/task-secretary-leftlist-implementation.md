# Secretary Left-Side Lists — Implementation Tasklist

Source audit: `TASK/task-secretary-leftlist-audit-combined.md`
Last checked: 2026-08-02 (implementation pass)

Status meanings: **Done** means the current code meets the audit requirement; **Partial** means some supporting behavior exists but the requirement is incomplete; **Todo** means the audit finding is still present.

## Page order

1. Appointments Directory
2. Unresolved Appointments
3. Appointment Requests
4. Chat Inbox
5. Communication History
6. Shared server-side pagination/realtime contract

## Appointments Directory

| Status | Task | Current evidence / next action |
|---|---|---|
| Done | Initial loading is represented by skeleton rows | `appointments-table.tsx` renders seven rows matching the name/status, service, and date/doctor layout. |
| Done | Failed initial load is distinct from an empty result and has Retry | `use-secretary-appointments.ts` exposes `error`; `appointments-table.tsx` renders a retryable error state. |
| Done | Preserve old rows during refresh and expose refresh state | `use-secretary-appointments.ts` separates initial loading from `isRefreshing`; `appointments-table.tsx` keeps rows visible and renders a progress stripe. |
| Done | Prevent the selected detail from remaining open after search/filter/tab changes | The hook clears a selected id that is no longer in the filtered result; tab changes already clear it synchronously. |
| Done | Add interim client-side Show More for rendered rows | `AppointmentsTable` exposes a guarded Show More action backed by the server cursor page; the client no longer renders an unbounded appointment dataset. |
| Done | Await list refresh after reschedule/cancel actions | Both mutation success paths now await `fetchData()`. |
| Done | Replace the unbounded appointment fetch with a server-side summary/cursor query | `get-clinic-appointments-page.dto.ts`, page action/repository, `PageResult`, and stable `created_at/id` cursor are implemented. Legacy unbounded callers remain intact for non-left-list consumers. |
| Done | Move search, status, doctor, and date filters to the server | The directory hook sends search, doctor, date, status, and tab status-set filters to the page action. |
| Done | Return exact totals and `hasMore` from the server | The repository uses a separate exact count query and fetches `limit + 1` rows for `hasMore`; the tabs consume server totals. |

## Unresolved Appointments

| Status | Task | Current evidence / next action |
|---|---|---|
| Done | Replace text loading state with matching skeleton rows | The view now renders five shared `Skeleton` rows matching the list layout. |
| Done | Render fetch errors | Error text remains visible and is now paired with Retry. |
| Done | Add Retry and a manual refresh/stale indicator | The sidebar has a refresh button and displays the latest successful refresh time. |
| Done | Reset mobile view to list when changing tabs | Both tab handlers now clear the mobile detail view. |
| Done | Clear selection when search hides the selected appointment | Search clears selection immediately; the hook also validates selection after list changes. |
| Done | Replace the unbounded appointment fetch with server-side status/date filters | The follow-up hook sends status, date-before, unresolved-no-show, and search filters to the cursor page action, with exact per-tab totals. |

## Appointment Requests

| Status | Task | Current evidence / next action |
|---|---|---|
| Done | Render list skeleton rows | `pending-request-list-v2.tsx` uses the shared `Skeleton` component. |
| Done | Start inquiry loading as `true` | `use-secretary-inquiries-queue.ts` now initializes the state as `true`, preventing an empty-state flash. |
| Done | Render inquiry errors with Retry | `PendingRequestListV2` renders full-page and stale-row error states with Retry. |
| Done | Clear selection on tab switch and when search hides the selected inquiry | Tab and search handlers clear the selected inquiry and reset mobile detail mode. |
| Done | Guard overlapping inquiry reloads | `loadInquiries` now uses a request sequence and handles rejected requests. |
| Done | Add pagination and a guarded Show More action | `get-inquiries-page.action.ts` and repository return cursor, exact total, and `hasMore`; the list guards duplicate loads and retries failures. |
| Done | Add realtime or refresh-on-focus behavior | The queue refreshes on `visibilitychange` and preserves existing rows during refresh. |

## Chat Inbox

| Status | Task | Current evidence / next action |
|---|---|---|
| Done | Use a proper first-load skeleton | `SidebarThreadSkeleton` exists and is used. |
| Done | Make Show More query-aware and tab-local | `get-chat-threads-page.action.ts` and the new RPC apply Active/Archive, search, unread-only, and cursor filters before pagination. |
| Done | Add `isLoadingMore` guard, spinner, and retryable load-more error | Load More now guards duplicate clicks, disables while pending, and exposes Retry on failure. |
| Done | Realtime refresh | Message/appointment subscriptions remain active, and visibility refresh now rehydrates the current server-filtered page and totals. |
| Done | Keep loaded rows after status actions | Status actions now update the affected row locally instead of resetting to page one; refresh merges status updates into loaded rows. |
| Done | Show background refresh feedback | `fetchingThreads` renders a sidebar progress stripe during background refreshes. |
| Done | Return server totals instead of loaded-row counts | The chat page RPC returns exact filtered totals; Active and Archive badges use those totals. |

## Communication History

| Status | Task | Current evidence / next action |
|---|---|---|
| Done | Standardize email/SMS sidebar loading with shared Skeleton rows | Email, SMS, and timeline sidebars now use the shared `Skeleton` component. |
| Done | Replace resend `alert()` calls with toast feedback | Email and SMS hooks now expose timed toast feedback instead of blocking browser alerts. |
| Done | Add explicit list/timeline errors and Retry actions | Email, SMS, and appointment timeline fetches now expose inline errors and Retry. |
| Done | Guard timeline responses by request sequence/selected appointment | Timeline fetches use a request sequence and clear old entries when selection changes. |
| Done | Remove or paginate the silent 2,000-row activity cap | Communication History now uses `get_secretary_communication_summary_page`, which aggregates activity in SQL and returns a cursor page with exact filtered totals; the old capped action is no longer used by the page. |
| Done | Add independent timeline pagination | Selected appointment outbox entries use their own cursor page action, guarded Show More, and retryable load-more errors. |
| Done | Expose the email `onlyAppointments` filter | Email sidebar now includes an Appointment emails only checkbox. |
| Done | Expand search beyond patient name | Timeline search now covers patient, doctor, treatment, and latest activity preview; email/SMS search covers recipient and event type. |

## Shared contract and verification

| Status | Task | Current evidence / next action |
|---|---|---|
| Done | Introduce shared `initial/refreshing/loading-more/ready/empty/error` list state semantics | All six lists now distinguish first-load skeletons, stale-row refreshes, guarded loading-more, empty results, initial errors, and stale errors; `PageResult` centralizes the cursor contract. |
| Done | Add cursor-based page responses with exact `hasMore` | Appointments, follow-ups, inquiries, chat threads, communication summaries/timelines, and email/SMS outbox logs all use cursor/limit page responses with `limit + 1` detection and exact totals where tab counts are shown. |
| Done | Add server-side search/filter/tab handling | Directory, follow-ups, requests, chat, communication history, email, and SMS filters are sent to server-side actions/RPCs. |
| Done | Add realtime or visibility-change refresh policy to every list | Chat keeps realtime subscriptions; all other left lists refresh when the document becomes visible and preserve loaded rows while refreshing. |
| Partial | Add the audit edge-case test matrix | The cursor contract covers 0/1/3/20/21/40/41 rows and malformed cursors in `page-result.spec.ts`; affected hook suites cover current selection/actions. Additional browser-level double-click/realtime SQL integration coverage remains a follow-up. |

## Completed in this implementation pass

- Appointments Directory list loading now uses skeleton rows, retryable errors, cursor-based server filters/totals, non-blocking refresh, Show More, selection validation, and awaited post-action refreshes.
- Unresolved Appointments now has skeleton rows, Retry, manual refresh/stale feedback, server-side status/date/search filters, cursor pagination, mobile tab reset, and selection validation.
- Appointment Requests now starts in loading state, renders retryable errors, uses server-side tab/search cursor pagination, clears selection on tab/search changes, guards overlapping reloads, and refreshes on visibility.
- Chat Inbox now has server-filtered tab/search/unread cursor pagination with exact tab totals, guarded/retryable Show More, background refresh feedback, status-update subscriptions, visibility refresh, and local status updates that preserve loaded rows.
- Communication History now has a server-aggregated cursor summary (replacing the page's capped activity fetch), independent timeline pagination, exact tab totals, shared Skeleton loading, retryable list/timeline errors, toast resend feedback, timeline race protection, selection reset, visibility refresh, and broader search.

## Deployment note

- The repository includes `migrations/20260802150000_secretary_left_list_pagination.sql`, which adds the stable indexes and the communication/chat page RPCs. Apply this migration to the target Supabase database before deploying the new server actions.

Verification: `tsc --noEmit` passed; the cursor contract plus the appointments, inquiries, and email hook suites pass (12 tests total). The full Vitest run reached the existing unrelated failures in resend-email, dashboard summary, manual-booking subscriber/action suites, and environment-dependent email tests, but did not complete within the bounded verification window.
