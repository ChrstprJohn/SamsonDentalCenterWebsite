# Performance Recommendations for Secretary Chat Inbox

## Audited Bottlenecks

1. **Redundant Auth Calls on Initial Load**
   - The `/secretary-v2/chat` page calls `getChatThreadsAction` which performs a full `supabase.auth.getUser()` check.
   - The wrapping `layout.tsx` has already performed this check and confirmed the user has `SECRETARY` or `ADMIN` roles.
   - This results in two consecutive round-trips to the Supabase auth endpoint, adding ~150ms-300ms of unnecessary latency.

2. **Global Realtime Triggering Heavy Re-fetches**
   - In `SecretaryChatInboxView`, a global subscription listens to all changes on the `appointment_messages` table.
   - Every single message insert/update triggers a call to `fetchThreads()` (calls the RPC to load all threads again) and `getMessagesAction()` (calls the DB to get messages again if it's the active thread).
   - This makes the UI feel slow and results in high CPU/database load under concurrent chat activity.
   - Additionally, `PatientChatView` already has a scoped realtime listener `chat_room_${appointmentId}` which updates messages in memory without needing database re-fetches.

---

## Proposed Optimizations

### 1. Skip Redundant Auth Check in Server Component
- Update `getChatThreadsAction` to accept a `skipAuth?: boolean` parameter.
- Use `skipAuth: true` in the `page.tsx` server component to bypass `auth.getUser()` safely since the layout has already guarded the route.

### 2. In-Memory Thread State Updates on Realtime Events
- Modify the global subscription in `SecretaryChatInboxView` to update the thread's latest message, unread count, and order in-memory rather than invoking `fetchThreads()` and `getMessagesAction()`.
- If the thread doesn't exist in memory, perform a fetch fallback.

---

## Implementation Log

- [x] Add `skipAuth` option to `getChatThreadsAction` and use it in `page.tsx`
- [x] Refactor `SecretaryChatInboxView` to handle realtime thread list updates in-memory and remove redundant DB fetches
