# Navigation Race Condition Bug (Secretary Portal V2)

## Findings
- **Cause**: Next.js App Router uses client-side transitions for `<Link>` and `router.push`. When a page is slow to load (e.g., fetching large datasets on the server), and the user clicks multiple navigation links in rapid succession, multiple asynchronous page transitions are queued.
- **Race Condition**: The network responses can resolve out of order. A faster page (e.g., `pending`) might load first, but the response for the slower page (e.g., `chat`) arrives shortly after and overrides the active page rendering, even though the URL has already updated to the last clicked route.
- **Solution**: 
  1. Use React's `useTransition` to track page transitions.
  2. Implement a unified navigation state/handler in `SecretarySidebar`.
  3. Disable pointer events (`pointer-events-none`) and apply a loading style (e.g., lower opacity, skeleton loaders, or cursor waiting state) to all sidebar navigation items while `isPending` is true.
  4. Show a global visual progress/loading bar at the top of the sidebar or layout to indicate loading state.

## Recommended Fix
- Wrap navigation calls in `startTransition` using `useRouter` and `useTransition` in the parent `SecretarySidebar`.
- Pass `isPending` and a unified `onNavigate` handler down to `NavMainSecretary` and `NavProjectsSecretary`.
- Disable links and show a premium loading indicator when `isPending` is active.
