# Secretary V2: Performance, Security, and Reliability Audit

**Date:** 2026-08-02
**Scope:**

- `/secretary-v2/check-in` — Check-In / Out
- `/secretary-v2/pending` — Appointment Requests
- `/secretary-v2/book` — Calendar
- `/secretary-v2/chat` — Chat Inbox
- `/secretary-v2/appointments` — Appointments Directory
- `/secretary-v2/past-follow-ups` — Unresolved Appointments
- `/secretary-v2/communication-logs` — Communication History

**Primary objective:** reduce initial loading work, duplicate calls, unnecessary realtime refreshes, oversized database payloads, and avoidable backend work without changing functional behavior.

**Explicit non-goal:** no data caching, stale-while-revalidate behavior, or other stale-data strategy is proposed. The recommendations below keep reads authoritative and fresh; they reduce the amount and duplication of work instead.

## Executive assessment

The seven pages already have some useful foundations: cursor-based list pagination on the newer list views, server-side filtering, request-generation guards in several hooks, loading/error/retry states, and a selected-room realtime channel for chat messages. The largest remaining issues are not cosmetic:

1. **Chat authorization and data exposure need to be fixed before optimization.** The staff chat route invokes public server actions with `skipAuth`, the `appointment_messages` select policy currently allows all roles including `anon`, and the chat-related `SECURITY DEFINER` RPCs do not show explicit `REVOKE`/`GRANT` protection in the migration history. This can expose appointment conversations and makes the performance architecture unsafe.
2. **Several pages load the same data more than once.** Calendar loads doctors/services in both the hook and the view; Chat server-renders a first thread page and then fetches it again on mount; multiple list pages fetch a full active page plus a one-row page for every other tab just to obtain counts.
3. **The appointment list query is too wide for list screens.** The legacy query uses `select('*')` with nested patient, guest, service, and complete status-history data. Check-In and Calendar use this same shape even though their list/timeline rows need a small summary.
4. **Communication History has a likely database scaling bottleneck.** Its summary RPC aggregates the entire `outbox` table, extracts appointment IDs from JSON, and only then applies the page/search filters. This gets slower as the outbox grows and has no appointment-ID indexable column.
5. **Realtime is broader than the UI needs.** Check-In subscribes to every appointment event and reloads three server actions per event. Chat subscribes globally to all message inserts and appointment updates and often refetches the whole thread list. Notification realtime also runs on every Secretary V2 page and can cause `router.refresh()`.

The report is an audit and recommendation set. No application source was changed by this audit. The working tree already contained uncommitted edits in five Secretary view files; those changes were preserved.

## Evidence and confidence

The findings below were derived from the current route files, hooks, views, server actions, repositories, migrations, triggers, and existing `TASK` notes. A read-only local runtime check initially redirected to `/login`; after the user authenticated, all seven requested routes were smoke-tested. Exact network waterfalls and latency were not captured because the browser runtime did not expose the page resource-timing API, so timings should still be added during implementation verification.

Where a finding says “verify deployed privileges,” the repository migration history is not sufficient to prove the current Supabase grants. Treat the finding as high priority until the deployed database is checked.

## Severity guide

| Priority | Meaning |
| --- | --- |
| P0 | Security/privacy or authorization issue; fix before exposing or optimizing the affected flow. |
| P1 | Material performance, correctness, or operational risk that will worsen with data volume. |
| P2 | Safe cleanup or polish after P0/P1 work; useful but not an immediate blocker. |

## Authenticated runtime smoke pass

The user’s authenticated local session was used to open each requested route. The following states were observed:

| Route | Runtime observation |
| --- | --- |
| Check-In / Out | Rendered live Aug 2 appointment rows, checked-in rows, completed rows, and no-show section. |
| Appointment Requests | Rendered New/Converted/Dropped tabs and a live request after the initial skeleton state. |
| Calendar | Rendered the Aug 2 day grid, four doctor columns, and live appointment blocks. |
| Chat Inbox | Rendered Active/Archive counts; selecting a thread loaded its messages and send control. |
| Appointments Directory | Rendered Active/History counts and live appointment rows after the initial skeleton state. |
| Unresolved Appointments | Rendered Checkouts/No-shows tabs, refresh control, timestamp, and an empty follow-up section. |
| Communication History | Rendered All Logs/Failed alerts counts, many log rows, and Show More. |

No browser console warnings or errors were reported during this smoke pass. This validates basic rendering and the main read/selection paths only; it does not prove request counts, database query plans, authorization policy behavior, mutation correctness, or production-scale latency.

## Page-by-page audit

### 1. Check-In / Out — `/secretary-v2/check-in`

#### Current load and interaction path

`use-secretary-check-in-out-tracker.ts` initially calls these three actions in parallel:

- `getClinicAppointmentsAction({ date: today })`
- `getDoctorsAction({ includeHidden: true })`
- `getServicesAction('BOOKABLE')`

The hook also starts a 60-second clock update and subscribes to the entire `public.appointments` table. Any appointment insert, update, or delete immediately calls `fetchData()` again, which repeats all three actions.

#### Findings

- **P1 — The appointment feed is oversized.** `getClinicAppointmentsAction` uses the legacy clinic query with `select('*')` and nested `appointment_status_history(...all fields)`, patient/dependent, guest contacts, doctor, and service data. A day tracker should not fetch the complete status history for every appointment on every refresh.
- **P1 — A broad realtime event causes a full reload.** An unrelated appointment update—such as a notification flag, no-show metadata update, or confirmation-channel update—reissues the appointment, doctor, and service reads. Bursts can create overlapping requests; the last response is not guaranteed to be the newest response.
- **P1 — Realtime and mutation refreshes duplicate work.** Check-in, undo check-in, resolve-no-show, and status actions call `fetchData()` after mutation. The same database mutation can also generate the realtime callback, causing a second full load.
- **P1 — Services are loaded before they are needed.** The service list is used by rescheduling UI, not by the initial tracker rows. It can be loaded when the reschedule/detail interaction opens.
- **P1 — The doctor repository still uses active caching despite the stated non-goal.** `get-active-doctors.queries.ts` wraps the read in `unstable_cache`; its cached function does not accept/forward `includeHidden`, so a caller requesting hidden doctors can receive the default active-only result and the list can be stale. Remove this cache path and query the current doctor data directly with an explicit projection. The availability repositories also contain dead cache wrappers that return direct fetches; remove that dead scaffolding so future behavior is unambiguous.
- **P1 — Server actions perform repeated authorization reads.** Several status actions call `authorizeRole('SECRETARY')` and then call `getAuthenticatedUser()` again. Reuse the authenticated user returned by authorization.
- **P1 — Status mutations are multi-step.** Some actions read the appointment, invoke an RPC, update additional appointment fields, query again for outbox data, and dispatch outbox work synchronously. Preserve the status-transition guard, but move related writes into one transaction/RPC where possible and keep delivery processing out of the user request.
- **P2 — Blocking browser alerts are used for errors.** Replace `alert()` with the existing non-blocking error/toast pattern so a user cannot block the page while other state is changing.

#### Recommended safe shape

1. Add a check-in-specific day-summary query/RPC with only the columns required by the tracker and a deliberate maximum/page policy. Load detail/status history only when a row is opened.
2. Subscribe only to the appointment fields/statuses relevant to check-in, debounce event bursts, and use a request generation/abort guard. Keep the current visible rows while refreshing only if that does not violate the desired “no stale result” behavior; never commit an older response after a newer request.
3. After a successful mutation, either apply the returned row or perform one explicit authoritative refresh. Suppress the duplicate realtime refresh for the initiating event with a short request/version mechanism, without suppressing updates from other users.
4. Lazy-load services when reschedule opens. Keep doctors in the initial load only if the filter requires them.

### 2. Appointment Requests — `/secretary-v2/pending`

#### Current load and interaction path

The V2 hook is `use-secretary-inquiries-queue.ts`. Its initial refresh loads the active page, the doctor list, and a one-row page for each other status tab. Each page query also performs an exact count. Services are loaded on mount even before an inquiry is selected. Availability effects call month/date/slot actions as the staged service, doctor, date, or month changes.

#### Findings

- **P0 — Initial month is hard-coded to June 2026.** `currentMonth` is initialized with `new Date(2026, 5, 1)`, while the current date is August 2026. This can show the wrong month and make availability look incorrect on first open. Initialize from the current date or the selected inquiry date.
- **P1 — Tab counts perform unnecessary page reads.** `getInquiriesPageAction({ limit: 1 })` retrieves a row plus an exact count for each inactive tab. Add a count-only path, or have one server query return the active page and all tab counts in one controlled operation.
- **P1 — Doctor/service data is loaded before it is needed.** Doctors and services are fetched on mount for the inquiry form. Services can be loaded when the request/booking panel opens; doctors should be filtered to actually available doctors for the selected service/date rather than using an unfiltered full list.
- **P1 — The hook exposes an unused availability path.** It destructures `loadDoctorsForDate`, but `availableDoctors` is based on `allDoctors`. This is both unnecessary data and a correctness risk: the UI may offer doctors who are not available for the chosen date/service.
- **P1 — Search can become an expensive multi-query operation.** `getInquiriesPageQuery` combines several `%term%` `ILIKE` predicates, a service-name search, an ID lookup, an `IN` filter, and an exact count. The service-match ID set is not bounded before it is used. This can degrade with inquiry volume.
- **P1 — Search has no transport cancellation.** The debounce and active flag prevent some state updates, but the previous database request still runs. Use an abort/request-generation policy at the action boundary and do not commit responses for an obsolete search string.
- **P2 — Availability is assembled across several reads.** Month dates, schedules, service duration, appointments, and time blocks are read separately. Preserve the same availability rules, but consider one server-side availability operation after the query shape/indexes are measured.

#### Recommended safe shape

1. Fix the month initialization first because it is a functional defect.
2. Keep tab counts exact if the UI requires them, but return counts without row payloads. Do not add caching.
3. Make the availability response authoritative for the selected service/date and use `loadDoctorsForDate` instead of the full doctor list for the staged form.
4. Replace broad multi-column search with a normalized searchable column or a carefully indexed RPC. If `pg_trgm` is used, add indexes only after checking the actual search fields and query plans.

### 3. Calendar — `/secretary-v2/book`

#### Current load and interaction path

`use-secretary-book-appointment.ts` loads services, doctors, and the selected-day timeline. The view also has a mount effect that calls `getDoctorsAction()` and `getServicesAction('BOOKABLE')` again. Week mode maps seven dates to seven `getClinicAppointmentsAction({ date })` calls. Changing the selected day or booking/rescheduling can reload the legacy full appointment shape.

#### Findings

- **P1 — Doctors and services are duplicated on mount.** The hook and `secretary-book-appointment-view.tsx` both load them. This is a confirmed unnecessary-call path; the view should use hook state, and service data should be lazy where possible.
- **P1 — Week view creates seven full database requests.** `Promise.all(daysOfWeek.map(...))` sends seven appointment queries and each query includes the wide legacy payload. It also has no cancellation or response generation guard, so a fast week change can be overwritten by a slower earlier week.
- **P1 — Week reload dependency can repeat the seven-call batch.** The week effect depends on appointment state, so changing a booked appointment can trigger the whole week query again rather than updating one affected day.
- **P1 — Scheduler calls are dead in this route.** The hook destructures `loadAvailableDates`, `loadDoctorsForDate`, and `loadAvailableSlots`, but the booking form currently uses a raw time input and local empty availability arrays. Dead scheduler state is confusing and should either be removed or deliberately wired into the form. Do not add extra availability calls without a product decision.
- **P1 — A raw time input can submit an arbitrary time.** The database/RPC must remain the final authority for schedule/doctor conflicts and duration. The UI should show server-provided available slots only if that is the intended behavior; otherwise the action should return a clear validation error without making extra preflight calls.
- **P1 — Patient selection performs an extra dependents read.** This is appropriate when the patient is selected, but it should not occur before selection and should return only the dependent fields needed by the form. Remove the production `console.log(dependents)` in the dependent action.
- **P2 — Reschedule/cancel refreshes the entire timeline.** Prefer returning the authoritative updated appointment and updating the affected day, while retaining a fallback full refresh for conflict/error recovery.

#### Recommended safe shape

1. Make the hook the single owner of doctors/services/timeline state; remove the duplicate view effect.
2. Add a range/day-summary query for week mode, or at minimum add a request ID and stop reloading all seven days when only one day changed.
3. Keep server-side booking validation and transaction/RPC behavior unchanged while reducing only preflight/read work.
4. Lazy-load the booking/reschedule form’s service/dependent data when opened.

### 4. Chat Inbox — `/secretary-v2/chat`

This is the highest-risk page because performance shortcuts currently cross the authorization boundary.

#### Current load and interaction path

- The route is `force-dynamic` and calls `getChatThreadsAction({ limit: 20, offset: 0, skipAuth: true })` on the server.
- `SecretaryChatInboxView` then performs another initial thread fetch after mount. The refresh also fetches the active page and a one-row page for the other tab.
- The view fetches doctors/services on mount for actions that are only needed when a thread action/reschedule form opens.
- The global inbox channel listens to every `appointment_messages` insert and every `appointments` update. It may refetch the full thread list for unrelated changes.
- Selecting a thread calls `markMessagesAsReadAction`; `useChatMessages` also marks messages read when the detail view mounts, creating duplicate writes.

#### Findings

- **P0 — Staff page bypasses action authentication.** `src/app/(portals)/secretary-v2/chat/page.tsx` passes `skipAuth: true` to `getChatThreadsAction`. The action uses an admin client in that branch. A server action is independently callable; the fact that the layout normally authenticates the route is not sufficient. Replace the bypass with an authenticated server action or a private server-only repository function that cannot be reached as a public action.
- **P0 — Message reads also have an auth bypass.** The staff view passes `skipAuth: true` to `getMessagesAction`. Apply the same fix. Keep a separate, strictly validated token path for guests if guest chat is required; do not expose a generic bypass option.
- **P0 — `appointment_messages` select policy is too broad.** Migration `20260713150000_add_appointment_chat.sql` enables RLS but defines a select policy with `USING (true)` for `anon, authenticated`. That is an appointment-message privacy breach if the deployed policy matches the migration. Restrict reads to the appointment owner/authorized staff, and make guest-token reads server-only or enforce the token in a narrowly scoped policy/function. Revoke direct anonymous access.
- **P0 — Caller-controlled identity fields are trusted.** `sendMessageAction` and `markMessagesAsReadAction` accept role/name/reader-role values from the caller. The sender role and staff identity must be derived from the authenticated user; the appointment/chat token must be checked against the exact appointment and permitted operation. An authenticated user must not be able to mark arbitrary appointments read.
- **P0 — Chat RPC exposure must be verified.** The chat thread/page RPCs are `SECURITY DEFINER`, and the migration history does not show explicit `REVOKE EXECUTE FROM PUBLIC, anon` followed by a controlled grant. PostgreSQL functions are executable by default unless privileges are changed. Verify deployed grants, add explicit SQL authorization checks, and restrict execution to the intended role.
- **P1 — Server-rendered threads are fetched again on mount.** Pass complete initial page state, including count/cursor data if needed, or skip the server fetch and use one authenticated client action. Do not hydrate a page and immediately make the same read again.
- **P1 — Realtime is too broad and refetches too much.** The global message/appointment subscription generates full thread-list requests for events outside the current inbox. Filter at the source where possible, debounce bursts, and refresh only the affected thread or an authoritative page when the event can change ordering/unread state.
- **P1 — Realtime fetch occurs inside a React state updater.** Calling `fetchThreads()` from inside `setThreads(previous => ...)` is a side effect and can run more than once under Strict Mode/concurrent rendering. Compute the next state first, then request outside the updater.
- **P1 — Existing rows can remain after they no longer match the server filter.** The `preserveExisting` merge adds/updates incoming rows but does not necessarily remove a thread that becomes archived, resolved, or excluded by search/unread filters. The UI can show a locally retained row that is not in the current authoritative result.
- **P1 — Initial action data is wider than needed.** Thread results include patient/guest identifiers and latest message data. Keep the list projection small; load full message history only for the selected appointment.
- **P1 — Duplicate mark-read writes.** Consolidate the parent selection handler and `useChatMessages` so only one component owns the read transition and it is idempotent.
- **P1 — Message sending performs synchronous outbox dispatch.** `send-message.action.ts` may dispatch pending outbox work during a user send. This adds unrelated delivery latency and can process other pending events. Enqueue the event and let the worker/API process it; keep a targeted retry path for an explicit resend.
- **P2 — Doctors/services are fetched before the action drawer opens.** Lazy-load these resources only when rescheduling or an action that needs them is opened.
- **P2 — Message length/name limits should be explicit.** Enforce input size, allowed role values, and rate limits server-side before inserting rows or emitting notifications.

#### Recommended safe shape

1. Close the authorization gaps first: authenticated staff action, validated guest-token action, strict RLS, RPC grants, and server-derived identity.
2. Make one owner responsible for initial thread data and one owner responsible for read state.
3. Use a scoped channel for the selected room and a filtered/debounced inbox signal for list ordering/unread changes. Do not broadcast or process full message payloads to every Secretary page.
4. Keep the current cursor pagination and server-side filters, but replace merge-by-accumulation with an authoritative replacement for the current page/filter or a rigorously bounded reconciliation.

### 5. Appointments Directory — `/secretary-v2/appointments`

#### Current load and interaction path

`use-secretary-appointments.ts` uses cursor pagination and server-side filters. Initial loading fetches the active page, doctor options, and a one-row page for the other status tab. The list query uses `clinic-appointments-page.queries.ts`.

#### Findings

- **P1 — The inactive tab read is only used for a count.** Pulling a row plus an exact count for the other tab is unnecessary payload. Use a count-only query or return all required tab counts from one controlled query.
- **P1 — The list projection is too wide.** `APPOINTMENT_SELECT` includes `*`, nested status history, guest contacts, and related entities. This is especially expensive for a directory with load-more pagination. Use a summary projection for the table and lazy-load the detail pane.
- **P1 — Search performs several scans/ID merges.** The search helper runs multiple queries and constructs an `IN` list before the page query. `%term%` matching without suitable indexes will worsen with patient/guest/appointment volume. Use a normalized search field or one SQL RPC with an indexed strategy.
- **P1 — Index coverage should match the actual cursor filters.** The current created-at/id index helps the default order, but status/date/doctor filters may still sort/filter large sets. Use `EXPLAIN (ANALYZE, BUFFERS)` for the real combinations before adding composite indexes.
- **P2 — Visibility refresh is useful but should be bounded.** Refreshing on every tab visibility event is acceptable for no-cache freshness, but avoid overlapping refreshes and preserve the current cursor/filter state.

#### Existing strengths to preserve

- Cursor-based page loading and server-side filters are the right direction.
- Current list UI has loading/error/retry/load-more behavior in the present implementation.
- Do not replace this with client-side loading of the full directory.

### 6. Unresolved Appointments — `/secretary-v2/past-follow-ups`

#### Current load and interaction path

`use-past-appointment-follow-ups.ts` requests cursor pages with `dateBefore: today` and `noShowUnresolved`. It also requests a one-row page for the alternate tab to display a count. Resolving an appointment then awaits a fresh list load.

#### Findings

- **P1 — The alternate-tab request is another row read used for a count.** Use a count-only path or combine counts with the active page response.
- **P1 — The list repeats filtering on the client.** The server already receives date/status/unresolved filters, but the hook filters the returned list again. This is not the main bottleneck, but it creates two sources of truth and can hide a server-filter defect. Use the authoritative server response and validate the contract in tests.
- **P1 — Unresolved no-show lookup lacks a targeted partial/composite index.** A partial index for unresolved no-shows combined with date/status/order should be evaluated against the actual query plan.
- **P1 — Resolve-no-show is multi-step.** The action reads a full appointment, calls a status RPC, may issue a second appointment update for no-show resolution, may query again for completion/outbox data, and dispatches outbox work. Preserve the transition checks, but make the related changes atomic and return the final row/event state.
- **P2 — Realtime is not required for freshness here, but refresh overlap must be controlled.** Keep explicit refreshes and visibility refreshes; guard them so a slower previous request cannot overwrite a newer filter or mutation result.

#### Existing strengths to preserve

- Cursor pagination, server-side date/status filtering, selection validation, and current loading/error/retry UI are good foundations.
- The post-mutation refresh is awaited in the current implementation; keep that correctness behavior while reducing the query/mutation fan-out.

### 7. Communication History — `/secretary-v2/communication-logs`

#### Current load and interaction path

`use-appointment-email-timeline.ts` loads a summary page and a one-row read for the alternate tab. Selecting an appointment loads a cursor timeline page and related patient emails. Resend loads the outbox record and related recipient data, creates/updates an event, and can synchronously invoke the global dispatcher.

#### Findings

- **P0/P1 — The summary RPC scans and aggregates the whole outbox.** `getCommunicationSummaryPageQuery` in migration `20260802150000_secretary_left_list_pagination.sql` builds `raw_activity` from all outbox rows, extracts appointment IDs from JSON payloads with a regex, aggregates them, and only then applies search/tab/cursor logic. This is the most likely current database scalability bottleneck in the seven-page scope. It has no date bound and its `COUNT(*) OVER()` is exact but expensive.
- **P1 — Appointment ID is stored inside JSON for timeline filtering.** The detail query uses JSON containment for the appointment ID and runs a separate exact count. Add a normalized/generated `appointment_id` column (or an equivalent indexed structure) and an index such as `(appointment_id, created_at DESC, id DESC)`. Backfill and dual-read/dual-write carefully so no communication history disappears during migration.
- **P1 — Communication search is unindexed substring search.** The summary RPC uses `CONCAT_WS(...) ILIKE '%' || p_search || '%'`. Use a normalized search vector/trigram strategy and confirm it with query plans. Do not trade correctness for a client-side filter.
- **P1 — Outbox access must be checked as a data-security boundary.** The outbox migration creates JSON payloads containing delivery data, but the repository migration history does not show RLS enabled/policies for `public.outbox`. Verify PostgREST grants and direct API access in the deployed database; enable least-privilege RLS/revoke direct access if the table is exposed. Keep server-only/admin access for staff actions.
- **P1 — Resend does too much work in the request.** `resend-email.action.ts` reads a full outbox row, queries contacts/appointment/user data, updates/inserts, and calls the global dispatcher. Limit selected columns, validate event type/status, enqueue a targeted resend, and let the worker deliver asynchronously.
- **P1 — The summary RPC is `SECURITY DEFINER` without an evident SQL role check.** Protect execution privileges and add an explicit authenticated Secretary/Admin check inside the function or ensure only a trusted server role can call it. Do not rely only on the page layout.
- **P2 — Expanded raw payloads can be large and sensitive.** Keep the timeline useful, but return a bounded/redacted display payload rather than rendering arbitrary full JSON by default.

#### Recommended safe shape

1. First make summary reads selective and indexable: a maintained/normalized appointment ID, recent activity/status fields, and a page query that can use the tab/search/cursor predicates before aggregation.
2. Preserve exact counts only if the UI requires them; otherwise use a bounded count strategy that does not aggregate the complete outbox for every request.
3. Make resend enqueue-only from the user request, while preserving a separate explicit delivery status and retry path.

## Cross-cutting findings

### Frontend request and state management

- **Centralize ownership of each resource.** The same doctors/services/thread data is currently loaded by routes, hooks, views, and detail hooks. One layer should own the initial authoritative read; child components should receive it or lazy-load only when opened.
- **Use request cancellation or request generations consistently.** Debounce alone does not stop server work. Every date/week/search/filter change should either abort the previous request or carry a monotonically increasing request ID and ignore older responses.
- **Do not clear and re-skeleton the entire screen for every realtime event.** A small row update or targeted refresh is less disruptive and avoids repeated layout/paint work. This does not require caching; it requires scoped freshness updates.
- **Keep server pagination authoritative.** Do not fetch full lists to make client-side filtering/counts. Avoid merging new rows indefinitely when they no longer satisfy the current server query.
- **Lazy-load detail-heavy UI.** Appointment detail panes, reschedule dialogs, email renderers, and other rarely opened controls can be dynamically imported or rendered only after selection. Verify bundle impact before and after.
- **Remove production console logging.** At least dependent data and chat-related paths log sensitive/diagnostic data. Use structured, redacted server logs only where operationally needed.

### Auth, authorization, and server-action boundaries

- `src/shared/auth/auth.util.ts` derives role from `user.user_metadata?.role`. User metadata should not be the sole authorization source for Secretary/Admin permissions because it is not a trusted authorization claim. Use a server-owned role table or verified custom claim and make the database policies use the same trusted source.
- Several appointment RLS policies also inspect `auth.jwt()->user_metadata.role`; update the policy model as part of the role migration, with a compatibility plan so existing sessions do not lose access unexpectedly.
- Remove generic `skipAuth` options from public server actions. Use private server-only functions for route-level prefetching and authenticated actions for browser calls. Every action must authenticate independently.
- Reuse the result of one authorization call instead of calling `auth.getUser()` multiple times in the same action.
- Derive `senderRole`, `senderName`, `readerRole`, and staff identity on the server. Validate appointment ownership/staff scope and chat tokens against the target appointment.
- Add maximum lengths and rate limits to message/search/resend inputs. A “performance” endpoint that accepts unbounded text can be used for resource exhaustion.

### Database, RPC, and trigger design

- Replace list-facing `select('*')` with explicit projections. This reduces database I/O, JSON serialization, network transfer, and browser memory, and makes PII review possible.
- For every `SECURITY DEFINER` function used by these pages: set a safe `search_path`, qualify object names, add an explicit authorization check, and explicitly revoke/grant `EXECUTE`. Do not assume a server action wrapper protects direct RPC calls.
- Review direct table grants and RLS for `appointment_messages`, `outbox`, `notifications`, `users`, and every table used by these page RPCs. The current repository contains multiple broad `USING (true)` policies; confirm which are intentional public catalog policies and which are accidental.
- Appointment updates fire several triggers for notifications, status/outbox events, approved messages, reminders, and modified timestamps. Ensure triggers use `UPDATE OF` and `WHEN` clauses for the columns that actually matter, and avoid querying patient/doctor/service data before the trigger knows that a relevant transition occurred. Keep an audit of every transition before consolidating triggers.
- Do not synchronously process the global outbox from ordinary page mutations. A dispatcher that claims up to ten pending events can make one Secretary action process unrelated email/SMS work and increase tail latency.

### Index/query work to validate with `EXPLAIN`

Evaluate these against production-like row counts and the exact generated SQL; do not add indexes blindly:

- appointments: combinations of status/date/start-time, status/created-at/id, doctor/date, and a partial unresolved-no-show index;
- appointment inquiries: status/created-at/id plus indexed search fields or a search vector/trigram strategy;
- appointment messages: the existing appointment/created-at and unread indexes are useful; verify they are used by both history and thread queries;
- outbox: normalized appointment ID plus created-at/id, status/created-at/id, and any event-type/status query used by resend/dispatcher;
- notifications: recipient/role/read/created-at if notification counts are retained, with RLS filtering before broad realtime delivery.

## Current items that should not be reintroduced as “fixes needed”

The current V2 list implementations already include several improvements documented in the existing `TASK` files. Preserve them during the next pass:

- cursor pagination/load-more rather than loading an entire directory;
- server-side tab/search/status/date filtering;
- request-ID/selection guards in the newer list hooks;
- skeleton, error, retry, and empty states;
- visibility/manual refresh for pages that need fresh data without caching;
- scoped selected-room chat realtime;
- existing performance indexes for appointment messages, inquiry status/created-at, and general appointment ordering.

The older task notes describe some pre-V2 behavior such as unconditional refetches or missing error states. Reconfirm against current code before implementing those items; do not duplicate already completed work.

## Recommended implementation order

### Phase 0 — Security gates

1. Remove the staff chat route’s `skipAuth` calls and generic public bypasses.
2. Lock down `appointment_messages` reads and guest-token access.
3. Verify/restrict RPC `EXECUTE` privileges and add SQL-level role checks.
4. Verify/restrict outbox and notification direct access.
5. Replace caller-controlled chat identity fields with server-derived values.
6. Replace role checks based only on mutable user metadata with a trusted server/database authorization source.

### Phase 1 — Remove obvious duplicate work

1. Fix the pending-page hard-coded month.
2. Remove duplicate Calendar doctor/service loads.
3. Remove Chat server-hydration/client-refresh duplication.
4. Lazy-load services/doctors/dependents only when their panel is opened.
5. Replace inactive-tab “one row plus exact count” reads with count-only or combined count responses.
6. Reuse authenticated user objects inside actions.

### Phase 2 — Reduce database and network payloads

1. Introduce explicit summary projections for Check-In, Calendar, and Directory.
2. Add an authoritative range/day-summary read for Calendar week mode.
3. Replace inquiry/appointment/communication substring/JSON-ID search with indexed normalized strategies.
4. Normalize/index `outbox` appointment IDs and rewrite the communication summary RPC to filter before aggregation.
5. Make no-show/status/resend operations atomic or enqueue-only while retaining existing transition guards.

### Phase 3 — Scope freshness and polish

1. Filter/debounce appointment and notification realtime events.
2. Keep selected-room realtime separate from inbox ordering/unread signals.
3. Remove side effects from React state updaters and bound all overlapping requests.
4. Replace alerts/logging and lazy-load heavy detail components.
5. Add operational metrics for query duration, row counts, payload bytes, and realtime refresh counts.

## Verification plan before merging changes

### Authenticated browser checks

Run with a real Secretary account and, separately, an Admin account. Capture the network waterfall and count requests from a clean navigation to each route:

- initial load at zero, one, and 25+ rows;
- changing tabs, date/month/week, search, and filters quickly;
- opening/closing booking, reschedule, detail, and email panels;
- selecting an unread chat thread and sending one message;
- status/check-in/no-show/resend actions;
- browser tab visibility changes and realtime events from a second session.

The expected result is one authoritative request per required resource, no immediate duplicate hydration request, no seven-request week reload after a single-day change, and no full-page refresh for an unrelated realtime event.

### Race and correctness checks

- Start a slow old search/date/week request, then a newer one; confirm only the newest response is rendered.
- Trigger two realtime events quickly; confirm one bounded refresh/update and no loading flicker loop.
- Mutate an appointment from another session; confirm the row changes or leaves the current filtered list correctly.
- Verify tab counts remain exact after status transitions and do not require row payloads.
- Confirm invalid booking time and conflicting status transitions remain rejected by the authoritative server transaction.

### Security checks

- Invoke every involved server action directly while logged out.
- Attempt to call chat actions with a different appointment ID, forged role/name, and invalid/expired guest token.
- Attempt direct REST/RPC reads of `appointment_messages`, `outbox`, `notifications`, and staff chat RPCs as `anon`, patient, Secretary, and Admin.
- Inspect `pg_proc` privileges and RLS policies in the deployed database; do not rely only on migration text.
- Confirm no patient message, email payload, phone number, or staff-only record appears in a browser response outside its permitted scope.

### Database checks

For each list/search shape, run `EXPLAIN (ANALYZE, BUFFERS)` at representative volumes and record:

- total execution time and planning time;
- rows scanned versus rows returned;
- sort/hash spill behavior;
- index used;
- response row count and serialized payload size;
- communication summary time as outbox volume grows.

## Final audit conclusion

The safest performance path is to fix the chat authorization/data-exposure boundary first, then remove duplicate reads, then narrow projections and rewrite the communication summary query. These changes can preserve current UI behavior and fresh-data requirements without adding caching. The report should be treated as the implementation checklist; no source behavior has been changed by this audit.
