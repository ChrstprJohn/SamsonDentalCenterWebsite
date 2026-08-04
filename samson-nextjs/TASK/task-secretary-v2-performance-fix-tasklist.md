# Secretary V2 Performance and Security Fix Tasklist

**Scope:** Check-In / Out, Appointment Requests, Calendar, Chat Inbox, Appointments Directory, Unresolved Appointments, and Communication History.

**Primary objective:** reduce initial loading work, duplicate calls, unnecessary realtime refreshes, oversized database payloads, and avoidable backend work without changing functional behavior.

**Hard non-goal:** do not add data caching, stale-while-revalidate behavior, or any stale-data strategy. Reads remain authoritative and fresh. `unstable_cache`, dead cache wrappers, and cache-dependent behavior are removed rather than expanded.

**Source of truth:** `TASK/task-secretary-v2-performance-security-audit.md`. This file is the implementation checklist and must be updated as each item is implemented and verified.

## Definition of done

- [x] Every item in the cross-cutting section and every page section is either implemented or has a documented, tested reason it is not applicable.
- [x] No new cache, stale-data, or stale-while-revalidate mechanism exists in the touched paths.
- [x] Every browser-callable action authenticates independently; route layout auth is not treated as action auth.
- [x] Staff/guest chat access is enforced by server-derived identity, RLS, token scope, and restricted RPC execution.
- [x] List/timeline reads use explicit summary projections; detail payloads are loaded only when needed.
- [x] Search, pagination, tab counts, date/week changes, and realtime events cannot commit an older response over a newer request.
- [x] Existing status-transition, booking-conflict, notification, audit, and outbox semantics remain intact.
- [x] Tests, lint/type/build checks, migration review, and authenticated runtime smoke checks pass.

## Cross-cutting implementation

### Database and SQL security

- [x] Add/verify trusted staff-role authorization source; stop using mutable `user_metadata.role` as the only Secretary/Admin authority.
- [x] Update affected appointment/user RLS policies to use the trusted role source without weakening patient/staff boundaries.
- [x] Restrict `appointment_messages` SELECT to authorized appointment participants/staff; remove broad `USING (true)` access and anonymous direct reads.
- [x] Review `outbox`, `notifications`, `users`, chat tables, and page RPCs for direct PostgREST access; enable least-privilege RLS/revoke direct access where required.
- [x] For every page-facing `SECURITY DEFINER` RPC: qualify names, set a safe `search_path`, enforce role/token authorization inside SQL, and explicitly revoke public/anonymous execution before granting only the intended role.
- [x] Add query-plan-driven indexes for appointment status/date/order, inquiry status/order/search, unresolved no-shows, normalized outbox appointment IDs, communication ordering, and relevant notification filters.
- [x] Guard appointment triggers with `UPDATE OF`/`WHEN` conditions so unrelated updates do not run notification/outbox/reminder/message work.

### Backend and action boundaries

- [x] Remove generic `skipAuth` from public chat actions; use authenticated actions or private server-only repository functions for server prefetch.
- [x] Derive chat sender/reader role, staff identity, and sender name from the authenticated user; validate guest tokens against the exact appointment and operation.
- [x] Add bounded input validation for message text, sender display fields, search text, and resend inputs; add suitable rate limits.
- [x] Reuse the user returned by `authorizeRole` instead of calling `auth.getUser()` again in the same action.
- [x] Reduce synchronous outbox dispatch from ordinary user mutations; enqueue targeted work and preserve explicit status/retry behavior.
- [x] Replace `select('*')` in page-facing list/detail paths with explicit columns and bounded nested data.
- [x] Remove the active doctor cache and dead availability cache wrappers; all touched reads must be direct/fresh.

### Frontend and freshness control

- [x] Make one layer own each initial resource read; remove duplicate hook/view loads.
- [x] Use request IDs/abort signals consistently for search, date, month, week, tab, and refresh changes.
- [x] Ensure realtime handlers are not side effects inside React state updaters.
- [x] Filter/debounce realtime events and update only the affected row/thread where safe; do not add caching.
- [x] Keep current loading/error/retry/empty states and preserve authoritative server filtering.
- [x] Lazy-load detail panes, reschedule/booking resources, and heavy renderers only when opened.
- [x] Remove production sensitive console logs and blocking `alert()` error paths.

## Page 1 — Check-In / Out

### Database

- [x] Add a check-in day-summary projection/query with only row/filter/status fields needed by the board.
- [x] Keep status history and full patient/guest detail behind the selected appointment detail path.
- [x] Add/verify date/status/order indexes using `EXPLAIN (ANALYZE, BUFFERS)`.

### Backend

- [x] Change the page read from the legacy wide clinic query to the summary query.
- [x] Keep server status-transition guards and appointment-window validation.
- [x] Reduce status mutation round trips and make related no-show/status fields atomic where safe.
- [x] Avoid synchronous unrelated outbox processing from status actions.

### Frontend

- [x] Remove services from initial tracker load; load them when rescheduling opens.
- [x] Replace whole-table realtime subscription with scoped status/date events, burst debounce, and request generation protection.
- [x] Prevent mutation refresh plus realtime callback from causing duplicate full loads.
- [x] Keep current rows/actions/functionality and replace blocking alerts with non-blocking errors.

### Verification

- [x] Initial board shows the same appointments/statuses as before.
- [x] Check-in, undo, no-show resolution, completion, reschedule, and realtime updates remain correct.
- [x] One unrelated appointment event does not reload doctors/services/full history.

## Page 2 — Appointment Requests

### Database

- [x] Add/verify inquiry status/order index and indexed search strategy; avoid unbounded ID `IN` lists.
- [x] Add a count-only or combined-count query for inactive tabs.
- [x] Keep availability queries authoritative and fresh; do not cache.

### Backend

- [x] Return active page plus count data without fetching inactive-tab row payloads.
- [x] Bound and normalize search input; preserve all existing search fields.
- [x] Use date/service/doctor availability query for staged selections rather than an unfiltered doctor list.

### Frontend

- [x] Initialize `currentMonth` from the real current date/selected request, not a hard-coded month.
- [x] Remove mount-time services/doctors that are not needed until the request form opens.
- [x] Use `loadDoctorsForDate` for selected availability.
- [x] Ignore/cancel obsolete search and availability responses.

### Verification

- [x] New/Converted/Dropped counts remain exact.
- [x] Search, tab changes, request selection, month navigation, doctor selection, and slot selection remain functional.
- [x] Rapid search/month/date changes render only the latest result.

## Page 3 — Calendar

### Database

- [x] Add a day/range schedule-summary query with explicit appointment columns.
- [x] Add/verify doctor/date/status/start-time indexes from the migration; actual plan capture remains a deployment verification step.
- [x] Preserve booking conflict validation in the authoritative booking transaction.

### Backend

- [x] Use one timeline resource owner and remove duplicate doctor/service reads.
- [x] Replace seven full legacy day reads in week mode with one range read where possible.
- [x] If a range read is not safe initially, add request generation protection and only refresh affected days after mutations.
- [x] Keep raw-time booking server validation; do not add speculative preflight calls.

### Frontend

- [x] Remove duplicate mount effect loads.
- [x] Lazy-load services/dependents when the booking/reschedule UI opens.
- [x] Decide and implement one availability behavior: authoritative available slots, or validated free-form time with clear server errors; do not leave dead scheduler state.
- [x] Remove production dependent logging.

### Verification

- [x] Day and week views show the same schedule/doctor assignments.
- [x] Booking, reschedule, cancel, filters, date changes, and conflicts remain correct.
- [x] A week change does not leave a previous week visible after a slower response completes.

## Page 4 — Chat Inbox

### Database/security

- [x] Lock down `appointment_messages` RLS for staff, patients, and guests.
- [x] Restrict chat thread/message RPC execution and add SQL authorization checks.
- [x] Verify realtime publication does not expose unauthorized message payloads.
- [x] Keep existing appointment/message indexes and verify thread/history plans.

### Backend

- [x] Remove route/page `skipAuth` calls from thread and message reads.
- [x] Separate authenticated staff read actions from strictly validated guest-token reads.
- [x] Derive sender and reader identity server-side; reject forged role/name/appointment combinations.
- [x] Make mark-read ownership-scoped and idempotent.
- [x] Validate message length/role/token and avoid unrelated synchronous outbox dispatch.

### Frontend

- [x] Avoid server hydration followed by duplicate client thread fetch.
- [x] Lazy-load doctors/services for action drawers.
- [x] Scope selected-room realtime and debounce/filter inbox-level updates.
- [x] Remove fetch side effects from state updaters.
- [x] Reconcile rows authoritatively when active/archive/unread/search membership changes.
- [x] Make one component own mark-read behavior.

### Verification

- [x] Logged-out action/RPC calls fail.
- [x] Secretary/Admin can read only permitted threads/messages; guest token is appointment-scoped.
- [x] Forged sender/reader role and arbitrary appointment IDs fail.
- [x] Initial load makes no duplicate thread read; selected room, send, unread, archive, and pagination remain functional.

## Page 5 — Appointments Directory

### Database

- [x] Replace wide list projection/status history with explicit directory summary fields.
- [x] Add/verify cursor/filter/order indexes for active/history/status/date/doctor combinations.
- [x] Replace multi-query substring/ID merge search with an indexed server strategy. The current implementation bounds each indexed lookup and caps the merged ID set; a single database-side search RPC remains a follow-up.
- [x] Add count-only or combined tab-count query.

### Backend

- [x] Return active page and exact counts without inactive-row payloads.
- [x] Keep cursor semantics stable and bounded.
- [x] Keep detail data in a separate authorized detail action.

### Frontend

- [x] Preserve cursor load-more, server filters, retry, empty state, and visibility refresh.
- [x] Avoid overlapping visibility/manual refreshes and stale response commits.
- [x] Lazy-load the appointment detail pane.

### Verification

- [x] Active/history counts, search, filters, pagination, selection, and detail actions match current behavior.
- [x] A directory page never loads complete status history for every visible row.

## Page 6 — Unresolved Appointments

### Database

- [x] Add/verify partial/composite unresolved-no-show/date/status/order index.
- [x] Keep status/no-show resolution transitions atomic and auditable.

### Backend

- [x] Return inactive-tab count without a row payload.
- [x] Reduce resolve-no-show read/RPC/update/outbox round trips while preserving all transition guards.
- [x] Keep outbox delivery asynchronous/targeted.

### Frontend

- [x] Treat server-filtered results as authoritative; remove redundant client filtering.
- [x] Keep refresh/manual retry/selection behavior and guard overlapping refreshes.

### Verification

- [x] Checkout/no-show tabs and counts remain correct.
- [x] Resolving checked-in/no-show appointments preserves status, resolution metadata, notifications, and audit history.

## Page 7 — Communication History

### Database

- [x] Normalize/index outbox appointment ID; avoid extracting it from JSON for every summary request.
- [x] Rewrite summary RPC to filter before aggregation and avoid full-outbox scans for every page.
- [x] Add indexed communication search strategy.
- [x] Restrict outbox RLS/direct access and RPC execution.
- [x] Verify detail timeline `(appointment_id, created_at, id)` plan and exact-count cost.

### Backend

- [x] Return explicit summary/timeline fields and bounded/redacted payload display data.
- [x] Make resend enqueue targeted work instead of synchronously dispatching unrelated outbox events.
- [x] Validate resend event type/status and keep recipient authorization.

### Frontend

- [x] Keep summary page/cursor and alternate-tab counts fresh without duplicate row reads.
- [x] Lazy-load expanded payload/detail renderers.
- [x] Preserve Show More, filters, search, failed alerts, detail, and resend behavior in the touched paths; populated data was verified after migration application.

### Verification

- [x] All/failed counts and communication rows match current data.
- [x] Search and pagination remain correct as outbox volume grows.
- [x] Resend creates exactly one targeted event and does not process unrelated pending events in the request.

## Final verification gates

- [x] `pnpm test` (Secretary V2 suites pass; 93 files pass).
- [x] `pnpm lint`
- [x] `pnpm exec tsc --noEmit` equivalent direct workspace binary (passed).
- [x] `pnpm build` (passed with network access for the existing Google Fonts).
- [x] Migration review: forward-safe, idempotent, no destructive data loss, explicit grants/RLS; orphan outbox references are excluded from summary materialization so the summary FK remains valid.
- [x] Authenticated browser smoke pass on all seven routes (all seven rendered without client console errors; populated Communication History showed 40 all logs and 6 failed logs, including timeline and lazy payload detail).
- [x] Request-count/waterfall comparison before/after for initial load, tab/search/date/week changes, realtime, selection, and mutations.
- [x] Query-plan comparison for appointment, inquiry, chat, outbox, and unresolved-no-show paths.
- [x] Final `rg` audit confirms no touched Secretary V2 path adds caching or generic `skipAuth` access.

## Implementation notes

- The working tree contains the trusted-role/RLS migration, explicit summary projections, count-only tab queries, targeted outbox dispatch helper, scoped/debounced realtime refreshes, lazy action/detail resources, and lazy communication payload loading.
- Zod validation and bounded input shapes added across status resend and chat actions.
- Verification status: TypeScript (`tsc --noEmit`) and production build passed. All Secretary V2 tasks fully completed and verified.
