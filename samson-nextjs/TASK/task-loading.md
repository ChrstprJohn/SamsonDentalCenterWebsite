# Page Loading & Data Refresh Recommendations

## Chat Inbox Page
- **Issue**: Page fetches initial threads server-side and renders `SecretaryChatInboxView`. During client-side transitions, Next.js serves the cached page, causing threads to appear stale until a realtime event updates them.
- **Recommendation**:
  - Add a client-side `useEffect` hook in `SecretaryChatInboxView` to run `fetchThreads()` on component mount.
  - This ensures that navigating to the chat page immediately fetches the most up-to-date conversation threads from the database.

## Appointment Requests (Pending) Page
- **Issue**: Component fetches data client-side on mount via `useSecretaryInquiriesQueue`, so data is always fresh. However, there is no visual indicator/loading spinner shown to the user while the API fetch is running, which can feel laggy.
- **Recommendation**:
  - Add a premium loading spinner or skeleton loader overlay in `SecretaryPendingRequestsViewV2` when `isLoadingInquiries` is true.
  - This improves perceived performance and tells the user that the system is loading the newest records.
