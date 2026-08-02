# Secretary V2 Performance and Security Fix Tasklist

**Scope:** Check-In / Out, Appointment Requests, Calendar, Chat Inbox, Appointments Directory, Unresolved Appointments, and Communication History.

**Primary objective:** reduce initial loading work, duplicate calls, unnecessary realtime refreshes, oversized database payloads, and avoidable backend work without changing functional behavior.

**Hard non-goal:** do not add data caching, stale-while-revalidate behavior, or any stale-data strategy. Reads remain authoritative and fresh. `unstable_cache`, dead cache wrappers, and cache-dependent behavior are removed rather than expanded.

**Source of truth:** `TASK/task-secretary-v2-performance-security-audit.md`. This file is the implementation checklist and must be updated as each item is implemented and verified.

## Definition of done

- [ ] Every item in the cross-cutting section and every page section is either implemented or has a documented, tested reason it is not applicable.
- [ ] No new cache, stale-data, or stale-while-revalidate mechanism exists in the touched paths.
- [ ] Every browser-callable action authenticates independently; route layout auth is not treated as action auth.
- [ ] Staff/guest chat access is enforced by server-derived identity, RLS, token scope, and restricted RPC execution.
- [ ] List/timeline reads use explicit summary projections; detail payloads are loaded only when needed.
- [ ] Search, pagination, tab counts, date/week changes, and realtime events cannot commit an older response over a newer request.
- [ ] Existing status-transition, booking-conflict, notification, audit, and outbox semantics remain intact.
- [ ] Tests, lint/type/build checks, migration review, and authenticated runtime smoke checks pass.

## Cross-cutting implementation

### Database and SQL security

- [ ] Add/verify trusted staff-role authorization source; stop using mutable `user_metadata.role` as the only Secretary/Admin authority.
- [ ] Update affected appointment/user RLS policies to use the trusted role source without weakening patient/staff boundaries.
- [ ] Restrict `appointment_messages` SELECT to authorized appointment participants/staff; remove broad `USING (true)` access and anonymous direct reads.
- [ ] Review `outbox`, `notifications`, `users`, chat tables, and page RPCs for direct PostgREST access; enable least-privilege RLS/revoke direct access where required.
- [ ] For every page-facing `SECURITY DEFINER` RPC: qualify names, set a safe `search_path`, enforce role/token authorization inside SQL, and explicitly revoke public/anonymous execution before granting only the intended role.
- [ ] Add query-plan-driven indexes for appointment status/date/order, inquiry status/order/search, unresolved no-shows, normalized outbox appointment IDs, communication ordering, and relevant notification filters.
- [ ] Guard appointment triggers with `UPDATE OF`/`WHEN` conditions so unrelated updates do not run notification/outbox/reminder/message work.

### Backend and action boundaries

- [ ] Remove generic `skipAuth` from public chat actions; use authenticated actions or private server-only repository functions for server prefetch.
- [ ] Derive chat sender/reader role, staff identity, and sender name from the authenticated user; validate guest tokens against the exact appointment and operation.
- [ ] Add bounded input validation for message text, sender display fields, search text, and resend inputs; add suitable rate limits.
- [ ] Reuse the user returned by `authorizeRole` instead of calling `auth.getUser()` again in the same action.
- [ ] Reduce synchronous outbox dispatch from ordinary user mutations; enqueue targeted work and preserve explicit status/retry behavior.
- [ ] Replace `select('*')` in page-facing list/detail paths with explicit columns and bounded nested data.
- [ ] Remove the active doctor cache and dead availability cache wrappers; all touched reads must be direct/fresh.

### Frontend and freshness control

- [ ] Make one layer own each initial resource read; remove duplicate hook/view loads.
- [ ] Use request IDs/abort signals consistently for search, date, month, week, tab, and refresh changes.
- [ ] Ensure realtime handlers are not side effects inside React state updaters.
- [ ] Filter/debounce realtime events and update only the affected row/thread where safe; do not add caching.
- [ ] Keep current loading/error/retry/empty states and preserve authoritative server filtering.
- [ ] Lazy-load detail panes, reschedule/booking resources, and heavy renderers only when opened.
- [ ] Remove production sensitive console logs and blocking `alert()` error paths.

## Page 1 — Check-In / Out

### Database

- [ ] Add a check-in day-summary projection/query with only row/filter/status fields needed by the board.
- [ ] Keep status history and full patient/guest detail behind the selected appointment detail path.
- [ ] Add/verify date/status/order indexes using `EXPLAIN (ANALYZE, BUFFERS)`.

### Backend

- [ ] Change the page read from the legacy wide clinic query to the summary query.
- [ ] Keep server status-transition guards and appointment-window validation.
- [ ] Reduce status mutation round trips and make related no-show/status fields atomic where safe.
- [ ] Avoid synchronous unrelated outbox processing from status actions.

### Frontend

- [ ] Remove services from initial tracker load; load them when rescheduling opens.
- [ ] Replace whole-table realtime subscription with scoped status/date events, burst debounce, and request generation protection.
- [ ] Prevent mutation refresh plus realtime callback from causing duplicate full loads.
- [ ] Keep current rows/actions/functionality and replace blocking alerts with non-blocking errors.

### Verification

- [ ] Initial board shows the same appointments/statuses as before.
- [ ] Check-in, undo, no-show resolution, completion, reschedule, and realtime updates remain correct.
- [ ] One unrelated appointment event does not reload doctors/services/full history.

## Page 2 — Appointment Requests

### Database

- [ ] Add/verify inquiry status/order index and indexed search strategy; avoid unbounded ID `IN` lists.
- [ ] Add a count-only or combined-count query for inactive tabs.
- [ ] Keep availability queries authoritative and fresh; do not cache.

### Backend

- [ ] Return active page plus count data without fetching inactive-tab row payloads.
- [ ] Bound and normalize search input; preserve all existing search fields.
- [ ] Use date/service/doctor availability query for staged selections rather than an unfiltered doctor list.

### Frontend

- [ ] Initialize `currentMonth` from the real current date/selected request, not a hard-coded month.
- [ ] Remove mount-time services/doctors that are not needed until the request form opens.
- [ ] Use `loadDoctorsForDate` for selected availability.
- [ ] Ignore/cancel obsolete search and availability responses.

### Verification

- [ ] New/Converted/Dropped counts remain exact.
- [ ] Search, tab changes, request selection, month navigation, doctor selection, and slot selection remain functional.
- [ ] Rapid search/month/date changes render only the latest result.

## Page 3 — Calendar

### Database

- [ ] Add a day/range schedule-summary query with explicit appointment columns.
- [ ] Add/verify doctor/date/status/start-time indexes from actual query plans.
- [ ] Preserve booking conflict validation in the authoritative booking transaction.

### Backend

- [ ] Use one timeline resource owner and remove duplicate doctor/service reads.
- [ ] Replace seven full legacy day reads in week mode with one range read where possible.
- [ ] If a range read is not safe initially, add request generation protection and only refresh affected days after mutations.
- [ ] Keep raw-time booking server validation; do not add speculative preflight calls.

### Frontend

- [ ] Remove duplicate mount effect loads.
- [ ] Lazy-load services/dependents when the booking/reschedule UI opens.
- [ ] Decide and implement one availability behavior: authoritative available slots, or validated free-form time with clear server errors; do not leave dead scheduler state.
- [ ] Remove production dependent logging.

### Verification

- [ ] Day and week views show the same schedule/doctor assignments.
- [ ] Booking, reschedule, cancel, filters, date changes, and conflicts remain correct.
- [ ] A week change does not leave a previous week visible after a slower response completes.

## Page 4 — Chat Inbox

### Database/security

- [ ] Lock down `appointment_messages` RLS for staff, patients, and guests.
- [ ] Restrict chat thread/message RPC execution and add SQL authorization checks.
- [ ] Verify realtime publication does not expose unauthorized message payloads.
- [ ] Keep existing appointment/message indexes and verify thread/history plans.

### Backend

- [ ] Remove route/page `skipAuth` calls from thread and message reads.
- [ ] Separate authenticated staff read actions from strictly validated guest-token reads.
- [ ] Derive sender and reader identity server-side; reject forged role/name/appointment combinations.
- [ ] Make mark-read ownership-scoped and idempotent.
- [ ] Validate message length/role/token and avoid unrelated synchronous outbox dispatch.

### Frontend

- [ ] Avoid server hydration followed by duplicate client thread fetch.
- [ ] Lazy-load doctors/services for action drawers.
- [ ] Scope selected-room realtime and debounce/filter inbox-level updates.
- [ ] Remove fetch side effects from state updaters.
- [ ] Reconcile rows authoritatively when active/archive/unread/search membership changes.
- [ ] Make one component own mark-read behavior.

### Verification

- [ ] Logged-out action/RPC calls fail.
- [ ] Secretary/Admin can read only permitted threads/messages; guest token is appointment-scoped.
- [ ] Forged sender/reader role and arbitrary appointment IDs fail.
- [ ] Initial load makes no duplicate thread read; selected room, send, unread, archive, and pagination remain functional.

## Page 5 — Appointments Directory

### Database

- [ ] Replace wide list projection/status history with explicit directory summary fields.
- [ ] Add/verify cursor/filter/order indexes for active/history/status/date/doctor combinations.
- [ ] Replace multi-query substring/ID merge search with an indexed server strategy.
- [ ] Add count-only or combined tab-count query.

### Backend

- [ ] Return active page and exact counts without inactive-row payloads.
- [ ] Keep cursor semantics stable and bounded.
- [ ] Keep detail data in a separate authorized detail action.

### Frontend

- [ ] Preserve cursor load-more, server filters, retry, empty state, and visibility refresh.
- [ ] Avoid overlapping visibility/manual refreshes and stale response commits.
- [ ] Lazy-load the appointment detail pane.

### Verification

- [ ] Active/history counts, search, filters, pagination, selection, and detail actions match current behavior.
- [ ] A directory page never loads complete status history for every visible row.

## Page 6 — Unresolved Appointments

### Database

- [ ] Add/verify partial/composite unresolved-no-show/date/status/order index.
- [ ] Keep status/no-show resolution transitions atomic and auditable.

### Backend

- [ ] Return inactive-tab count without a row payload.
- [ ] Reduce resolve-no-show read/RPC/update/outbox round trips while preserving all transition guards.
- [ ] Keep outbox delivery asynchronous/targeted.

### Frontend

- [ ] Treat server-filtered results as authoritative; remove redundant client filtering.
- [ ] Keep refresh/manual retry/selection behavior and guard overlapping refreshes.

### Verification

- [ ] Checkout/no-show tabs and counts remain correct.
- [ ] Resolving checked-in/no-show appointments preserves status, resolution metadata, notifications, and audit history.

## Page 7 — Communication History

### Database

- [ ] Normalize/index outbox appointment ID; avoid extracting it from JSON for every summary request.
- [ ] Rewrite summary RPC to filter before aggregation and avoid full-outbox scans for every page.
- [ ] Add indexed communication search strategy.
- [ ] Restrict outbox RLS/direct access and RPC execution.
- [ ] Verify detail timeline `(appointment_id, created_at, id)` plan and exact-count cost.

### Backend

- [ ] Return explicit summary/timeline fields and bounded/redacted payload display data.
- [ ] Make resend enqueue targeted work instead of synchronously dispatching unrelated outbox events.
- [ ] Validate resend event type/status and keep recipient authorization.

### Frontend

- [ ] Keep summary page/cursor and alternate-tab counts fresh without duplicate row reads.
- [ ] Lazy-load expanded payload/detail renderers.
- [ ] Preserve Show More, filters, search, failed alerts, detail, and resend behavior.

### Verification

- [ ] All/failed counts and communication rows match current data.
- [ ] Search and pagination remain correct as outbox volume grows.
- [ ] Resend creates exactly one targeted event and does not process unrelated pending events in the request.

## Final verification gates

- [ ] `pnpm test`
- [ ] `pnpm lint`
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm build`
- [ ] Migration review: forward-safe, idempotent, no destructive data loss, explicit grants/RLS.
- [ ] Authenticated browser smoke pass on all seven routes.
- [ ] Request-count/waterfall comparison before/after for initial load, tab/search/date/week changes, realtime, selection, and mutations.
- [ ] Query-plan comparison for appointment, inquiry, chat, outbox, and unresolved-no-show paths.
- [ ] Final `rg` audit confirms no touched Secretary V2 path adds caching or generic `skipAuth` access.
